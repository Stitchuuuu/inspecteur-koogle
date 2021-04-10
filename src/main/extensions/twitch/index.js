import { Extension } from '@/extension'
import tmi from 'tmi.js'
import axios from 'axios'
import sharedobject from '@common/sharedobject'
import TwitchChatMessage from './twitchchatmessage'
import TwitchEvent from './twitchevent'
import fs from 'fs'
import { app } from 'electron'
import path from 'path'

const { SharedObject } = sharedobject


const CLIENT_ID = 'znlgct7x3dcy2m8r8t20wls3smem6p'
const CLIENT_SECRET = 'y8kzw2d2i9mfskcbgd9zqawkdyb92h'

const REDIRECT_URI = 'https://sirius.localhost/twitch'

// znlgct7x3dcy2m8r8t20wls3smem6p
// Secret: y8kzw2d2i9mfskcbgd9zqawkdyb92h
export class Twitch extends Extension {
	#user = null
	/**
	 * @type {tmi.Client}
	 */
	#tmi = null
	#promiseUser = null
	#refreshTimeout = -1

	// TODO: Must allow to save chat messages in file
	#listChatMessages = []
	#listEvents = []
	#lastFollows = []
	#sessionFollows = {}
	#timeoutFollows = {}

	static get extension() {
		return { name: 'twitch' }
	}

	constructor() {
		super(...arguments)
		if (this.$config.token) {
			this.user().then((u) => {
				if (!u) {
					this.$config.token = null
				}
				this.addTimeoutRefreshToken()
			}).catch((e) => {
				this.auth({ tryOnly: true }).then((res) => {
					if (!res) {
						this.$config.token = null
					}
				})
			})
		}
		const opts = {
			chatChannels: null,
			checkFollowersOnAllChannels: true,
		}
		for (const name in opts) {
			if (typeof this.$config[name] === 'undefined') {
				this.$config[name] = opts[name]
			}
		}
		this.channel = ''
		this.$data.chatStatus = 'disconnected'
		this.$data.chatChannelStatus = {}
		this.$config.checkFollowersOnAllChannels = true
		
		// Client asked last chat messages
		this.$ipc.handle('twitch:chat:last', () => {
			return this.#listChatMessages
		})
		// Client asked twitch connect
		this.$ipc.handle('twitch:connect', async() => {
			const user = await this.auth()
			return user
		})
		// Client asked disconnect
		this.$ipc.handle('twitch:disconnect', () => {
			this.disconnect()
			return true
		})
		this.$ipc.handle('twitch:topStreams', (data) => this.getTopStreams(data))
		this.$ipc.handle('twitch:events:last', (data) => this.getLastEvents(data))
		
		// On user change, we auto-connect to the chat
		this.on('user', async() => {
			if (!this.$config.chatChannels) {
				this.$config.chatChannels = this.#user.login
			}
			if (this.#tmi) {
				this.#tmi.disconnect()
				this.#tmi = null
			}
			if (this.$config.chatChannels) {
				this.startChatOnChannel(this.$config.chatChannels)
			}
			if (this.$config.checkFollowersOnAllChannels) {
				const logins = this.$config.chatChannels.map(n => 'login=' + n).join('&')
				const users = await this.helix('/users?' + logins).then(res => res.data.data)
				for (const u of users) {
					if (u.id !== this.#user.id) {
						this.subscribeToFollows(u.id, 5000)
					}
				}
			}

			setInterval(() => {
				const filepath = path.join(app.getPath('logs'), 'sessionFollows-debug.json')
				try {
					fs.writeFileSync(filepath, JSON.stringify(this.#sessionFollows, null, 2))
					// console.log('Debug file saved at:', filepath)	
				} catch (err) {
					//
				}
			}, 30000)
	
		})

		// On chatChannels change, we reconnect to new channels if there is a new
		this.$config.on('update:field:chatChannels', async(val) => {
			let disconnect = false
			if (this.#tmi && val) {
				const currentChannels = this.#tmi.getChannels().sort()
				const channels = Array.isArray(val) ? val.sort() : [val]
				if (channels.join(',') !== currentChannels.join(',')) {
					disconnect = true
				}
			}
			if (this.$config.checkFollowersOnAllChannels) {
				this.unsubscribeToFollows(true)
			}
			if (disconnect) {
				await this.disconnectChat()
			}
			if (val && val.length) {
				this.startChatOnChannel(val)
				if (this.$config.checkFollowersOnAllChannels) {
					const logins = this.$config.chatChannels.map(n => 'login=' + n).join('&')
					const users = await this.helix('/users?' + logins).then(res => res.data.data)
					for (const u of users) {
						if (u.id !== this.#user.id) {
							this.subscribeToFollows(u.id, 5000)
						}
					}
				}
			}
		})
	}
	async helix(optionsOrUrl) {
		const opts = { method: 'get', params: {}, data: null }
		if (typeof optionsOrUrl === 'string') {
			opts.url = optionsOrUrl
		} else {
			Object.assign(opts, optionsOrUrl)
		}
		if (!opts.url.startsWith('https://')) {
			opts.url = 'https://api.twitch.tv/helix' + (opts.url.startsWith('/') ? '' : '/') + opts.url
		}
		const headers = {'Client-ID': CLIENT_ID}
		if (this.$config.token && opts.auth !== 'application') {
			headers['Authorization'] = 'Bearer ' + this.$config.token.access_token
		}
		const axiosOptions = { method: opts.method, url: opts.url, headers, params: opts.params, data: opts.data }
		return axios(axiosOptions).then(res => {
			// console.log(`[Twitch] API Rate: ${res.headers['ratelimit-remaining']}`)
			return res
		})
	}
	user(force) {
		if (this.#user && !force) return new Promise(resolve => resolve(this.#user))
		else if (this.#promiseUser) return this.#promiseUser
		else {
			this.#promiseUser = new Promise(async(resolve, reject) => {
				try {
					const { data } = await this.helix('/users')
					this.#user = data.data[0]
					this.$data.user = this.#user
					this.emit('user')
					this.emit('update')
					resolve(this.#user)
				} catch(e) {
					reject(e)
					this.#promiseUser = null
				}		
			})
			return this.#promiseUser
		}
	}
	async isConnected() {
		try {
			const u = await this.user()
			return !!u
		} catch(err) {
			return false
		}
	}
	async followers(id) {
		try {
			const { data } = await this.helix({
				url: '/users/follows',
				params: {
					to_id: id || this.#user.id,
					first: 100,
				}
			})
			return data.data
		} catch(e) {
			console.log(e.response.data)
			throw e
		}
	}
	async checkNewFollows(id, checkInterval) {
		delete this.#timeoutFollows[id]
		try {
			const followers = await this.followers(id)
			for (const follow of followers) {
				const id = follow.to_id + ':' + follow.from_id
				if (!~this.#lastFollows.indexOf(id)) {
					this.#sessionFollows[follow.to_id].push({ username: follow.from_name, at: new Date(follow.followed_at), id: follow.from_id })
					const e = TwitchEvent.fromTwitchAPI_Follows(follow)
					this.$ipc.emit('event', e)
					this.$ipc.emit('event:follow', e)
					// console.log(e.at, `Follow | #${e.toChannel} @${e.fromUser}`)
					this.#lastFollows.push(id)
					this.#listEvents.push(e)
				}
			}	
		} catch (err) {
			console.log((new Date()).toISOString(), `Could not retrieve followers for #${id}.`, err)
		}
		
		this.#timeoutFollows[id] = setTimeout(() => {
			this.checkNewFollows(id, checkInterval)
		}, checkInterval)
	}
	async subscribeToFollows(id, checkInterval) {
		if (!id) {
			id = this.#user.id
		}
		const followers = await this.followers(id)
		for (const follow of followers) {
			this.#lastFollows.push(follow.to_id + ':' + follow.from_id)
		}
		this.#sessionFollows[id || this.#user.id] = []
		this.#timeoutFollows[id] = setTimeout(() => {
			this.checkNewFollows(id, checkInterval)
		}, checkInterval)
	}
	unsubscribeToFollows(id) {
		if (id === true) {
			const timeouts = Object.values(this.#timeoutFollows)
			for (const t of timeouts) {
				clearTimeout(t)
			}
			this.#timeoutFollows = {}
		} else {
			if (!id) {
				id = this.#user.id
			}
			if (this.#timeoutFollows[id]) {
				clearTimeout(this.#timeoutFollows[id])
				delete this.#timeoutFollows[id]
			}
		}
	}

	/**
	 * Get a token from a code
	 * @param code 
	 */
	async getToken(code) {
		const url = 'https://id.twitch.tv/oauth2/token'
		 + `?client_id=${CLIENT_ID}`
		 + `&client_secret=${CLIENT_SECRET}`
		 + `&code=${code}`
		 + `&grant_type=authorization_code`
		 + `&redirect_uri=${REDIRECT_URI}`
		try {
			const { data } = await axios.post(url)
			data.expires_at = new Date(Date.now() + data.expires_in * 1000)
			this.$config.token = data
			return data
		} catch(e) {
			console.log(e)
			throw e
		}
	}
	/**
	 * Refresh the token
	 */
	async refreshToken() {
		console.log('Refreshing token...')
		const url = 'https://id.twitch.tv/oauth2/token'
		+ `?client_id=${CLIENT_ID}`
		+ `&client_secret=${CLIENT_SECRET}`
		+ `&refresh_token=${this.$config.token.refresh_token}`
		+ `&grant_type=refresh_token`
	 try {
		 const { data } = await axios.post(url)
		 data.expires_at = new Date(Date.now() + data.expires_in * 1000)
		 this.$config.token = data
		 console.log('Refreshing token...ok !', data)
		 return data
	 } catch(e) {
		console.log('Refreshing token...nok !', e.response.data)
		throw e
	 }		
	}

	/**
	 * Ask the auth to Twitch in opening a new window
	 */
	async auth(options) {
		const opts = Object.assign({
			scopes: ['channel:manage:broadcast', 'chat:edit', 'chat:read', 'channel:read:redemptions'],
			force: false,
			tryOnly: false,
		}, options)
		const urlOAuth = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}`
			+ `&redirect_uri=` + encodeURIComponent(REDIRECT_URI)
			+ `&response_type=code`
			+ `&scope=` + encodeURIComponent(opts.scopes.join(' '))
			+ (opts.force ? `&force_verify=true` : '')
		const { data } = await Extension.oauth(urlOAuth, { 
			tryOnly: opts.tryOnly,
			window: {
				width: 550,
				height: 520,
				css: 'body { background-color: #18191B !important; } div.consent-banner { display: none !important; }'
			},
		})
		if (data.error) {
			if (!opts.tryOnly) {
				throw new Error(`${data.error}: ${data.error_description}`)
			} else {
				return false
			}
		} else if (data.code) {
			const token = await this.getToken(data.code)
			this.$config.token = token
			this.#user = await this.user()
			return this.#user
		}
	}

	/**
	 * Add the timeout for the refresh token
	 */
	addTimeoutRefreshToken() {
		let timeout = Math.min(2147483647, this.$config.token.expires_at - Date.now() - 10 * 60 * 1000)
		this.#refreshTimeout = setTimeout(async () => {
			await this.refreshToken()
			this.addTimeoutRefreshToken()
		}, timeout)
		console.log('> [Twitch] Will refresh timeout at', new Date(Date.now() + timeout))
	}
	async disconnectChat() {
		try {
			await this.#tmi.disconnect()
		} catch(err) {
			// 
		}
		this.#tmi = null
		this.chatStatus = 'disconnected'
		this.chatChannelStatus = {}
}
	startChatOnChannel(channel) {
		if (!channel && this.#user) {
			channel = this.#user.login
		}
		this.$data.chatChannelStatus = {}
		this.$data.chatStatus = 'disconnected'
		this.channel = Array.isArray(channel) ? channel.slice() : [ channel ]
		for (const c of channel) {
			this.$data.chatChannelStatus['#' + c] = 'disconnected'
		}
		const client = new tmi.Client({
			options: { debug: false, messagesLogLevel: "info" },
			connection: {
				reconnect: true,
				secure: true
			},
			identity: {
				username: this.#user.login,
				password: 'oauth:' + this.$config.token.access_token
			},
			channels: this.channel
		})
		client.on('join', (channel, username, self) => {
			if (self) {
				this.$data.chatChannelStatus[channel] = 'connected'
			}
		})
		client.on('part', (channel, username, self) => {
			if (self) {
				this.$data.chatChannelStatus[channel] = 'disconnected'
			}
		})
		client.on('disconnected', () => {
			this.$data.chatStatus = 'disconnected'
			this.$data.chatChannelStatus = {}
		})
		client.on('connected', () => {
			this.$data.chatStatus = 'connected'
		})
		client.connect().catch(console.error).then(() => {
			this.$data.chatStatus = 'connected'
		})
		client.on('message', (channel, data, message, self) => {
			const e = TwitchEvent.fromTmiJS_Message(null, channel.substr(1), message, data)
			this.#listEvents.push(e)
			this.$ipc.emit('event', e)
			this.$ipc.emit('event:message', e)
		})
		client.on('subscription', (channel, username, methods, message, data) => {
			const e = TwitchEvent.fromTmiJS_Subscription(null, channel.substr(1), methods, data)
			this.#listEvents.push(e)
			this.$ipc.emit('event', e)
			this.$ipc.emit('event:subscription', e)
			console.log(e.at, `Sub | #${e.toChannel} - ${e.fromUser} / ${e.plan} for ${e.planMonths} month(s)`)
		})
		client.on('raided', (channel, username, viewers) => {
			const e = TwitchEvent.fromTmiJS_Raided(null, channel.substr(1), username, viewers)
			this.#listEvents.push(e)
			this.$ipc.emit('event', e)
			this.$ipc.emit('event:raid', e)
			console.log(e.at, `Raid | #${e.toChannel} - ${e.fromUser} / ${e.viewers}`)
		})
		client.on('hosted', (channel, username, viewers, autohost) => {
			const e = TwitchEvent.fromTmiJS_Hosted(null, channel.substr(1), username, viewers, autohost)
			this.#listEvents.push(e)
			this.$ipc.emit('event', e)
			this.$ipc.emit('event:host', e)
			console.log(e.at, `Host | #${e.toChannel} - ${e.fromUser} / ${e.viewers} ${e.autohost ? '(autohost)' : ''}`, autohost)
		})
		client.on('cheer', (channel, data, message) => {
			const e = TwitchEvent.fromTmiJS_Cheer(null, channel.substr(1), message, data)
			this.#listEvents.push(e)
			this.$ipc.emit('event', e)
			this.$ipc.emit('event:cheer', e)
			console.log(e.at, `Cheer | #${e.toChannel} - ${e.fromUser} / ${e.bits} : ${e.message}`)
		})
		this.#tmi = client
	}
	randomNumber(x, y) {
		return Math.floor(Math.random() * (y - x)) + x
	}
	randomBoolean() {
		return !!(Math.floor(Math.random() * 2))
	}
	randomUsername() {
		const lpseudal = ['leviking278', 'samel92898', 'truc029092']
		const index = this.randomNumber(0, lpseudal.length - 1)
		return lpseudal[index]
	}
	fakeEvent(type) {
		const user = this.randomUsername()
		let e
		switch(type) {
			case 'raid':
				e = TwitchEvent.fromTmiJS_Raided(null, user, user, this.randomNumber(10, 1000))
				break
			case 'host':
				e = TwitchEvent.fromTmiJS_Hosted(null, user, user, this.randomNumber(10, 1000), this.randomBoolean())
				break
		}
		if (e) {
			this.$ipc.emit('event', e)
			this.$ipc.emit('event:' + type, e)
		}
	}
	disconnect() {
		if (this.#tmi) {
			this.#tmi.disconnect()
			this.#tmi = null
		}
		clearTimeout(this.#refreshTimeout)
		this.$config.token = null
		this.$config.chatChannels = null
		this.#user = this.#promiseUser = null
		Extension.removeCookies({ domain: 'twitch.tv' })
	}
	async getTopStreams({ after, before }) {
		console.log(after, before)
		const streams = await this.helix({
			url: '/streams',
			params: {
				first: 100,
				after: after || undefined,
				before : before || undefined
			}
		}).then(res => res.data)
		return { list: streams.data, cursor: streams.pagination.cursor } 
	}
	getLastEvents(options) {
		const opts = {
			...options,
			read: false,
		}
		return this.#listEvents.filter(e => {
			if (opts.read === null) return true
			else return opts.read === e.read
		})
	}
}
