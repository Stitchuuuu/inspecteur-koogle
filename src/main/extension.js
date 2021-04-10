import { EventEmitter } from 'events'
import { URL, URLSearchParams } from 'url'
import path from 'path'

import electron from 'electron'
import sharedobject from '@common/sharedobject'
import utils from '@common/utils'

const { SerializeJSON } = utils

const { SharedObject } = sharedobject
const { BrowserWindow, session, app } = electron

export class IPCHelper {

	#listeners = []
	#handles = []
	#ipc = null
	#id = null
	#suffix = ''
	#clients = new Map()
	#sharedObjectsEmitted = {}

	constructor(suffix, onData) {
		this.#suffix = suffix
		this.#ipc = electron.ipcMain
		this.#id = ((new Date()).getTime()).toString(36) + '.' + Math.floor(Math.random() * 10000).toString(32)
		// this.#ipc.on(`${this.#suffix}:on`, (event, arg) => this.registerEvents(event, arg))
		// this.#ipc.on(`${this.#suffix}:off`, (event, arg) => this.registerEvents(event, arg))
		this.#ipc.on('main:register-events', (event, arg) => this.registerEvents(event, arg))
	}
	registerEvents({ reply, sender, frameId, processId }, arg) {
		// console.log(`${this.#suffix}:on`, arg)
		// todo: listen to specific events
		console.log(`IPC | main:register-events from F:${frameId}|P:${processId}`)
		this.#clients.set(`${frameId}:${processId}`, { reply, sender, frameId, processId })
	}
	unregisterEvents(event, arg) {
		// TODO: remove client from event
	}
	on(event, listener) {
		this.#ipc.on(event, (...args) => {
			// console.log('IPC | on:'+event)
			listener.apply(this.#ipc, args)
		})
		this.#listeners.push({ event, listener })
	}
	once(event, listener) {
		this.#ipc.once(event, listener)
		this.#listeners.push({ event, listener })
	}
	removeListener(event, listener) {
		this.#ipc.removeListener(event, listener)
		const index = this.#listeners.findIndex(e => e.event === event && e.listener === listener)
		if (index >= 0) {
			this.#listeners.splice(index, 1)
		}
	}
	removeAllListeners(event) {
		this.#ipc.removeAllListeners(event)
		this.#listeners = this.#listeners.filter(e => e.event !== event)
	}
	_serializeDataIPC(val, options) {
		const opts = { trackSharedObject: true, ...options }
		return SerializeJSON(val, (key, value, original) => {
			if (original instanceof SharedObject && opts.trackSharedObject && !this.#sharedObjectsEmitted[original.$sid]) {
				this.#sharedObjectsEmitted[original.$sid] = (event) => {
					console.log(`SharedObject | sending update of #${original.$sid}`)
					this.emit('shared:' + original.$sid, event, { trackSharedObject: false, rawEvent: true })
				}
				original.on('update', this.#sharedObjectsEmitted[original.$sid])
				this.on('shared:' + original.$sid, (e, data) => {
					console.log('SharedObject | Must update + broadcast', original.$sid, data.tree)
					original.$receive(data)
					this.emit('shared:' + original.$sid, data, { trackSharedObject: false, rawEvent: true })
				})
			} else if (original instanceof Date) {
				value = {$class: 'Date', $value: value}
			}
			return value
		})
	}
	handle(channel, listener) {
		console.log(`IPC | Handler on ${channel}`)
		const handler = async(e, ...args) => {
			const o = listener.apply(e, args)
			let data
			if (o instanceof Promise) {
				data = await o
			} else {
				data = o
			}
			data = this._serializeDataIPC(data)
			console.log(`IPC | Handle ${channel}`, args)
			return data
		}
		this.#ipc.handle(channel, handler)
		this.#handles.push({ channel, handler })
	}
	handleOnce(channel, listener) {
		this.#ipc.handleOnce(channel, listener)
		this.#handles.push({ channel, listener })
	}
	removeHandler(channel) {
		this.#ipc.removeHandler(channel)
		const index = this.#handles.findIndex(e => e.event === event && e.listener === listener)
		if (index >= 0) {
			this.#handles.splice(index, 1)
		}
	}
	destroy() {
		for (const e of this.#listeners) {
			this.#ipc.removeListener(e.event, e.listener)
		}
		for (const h of this.#handles) {
			this.#ipc.removeHandler(h.channel)
		}
		this.#handles = []
		this.#listeners = []
	}
	emit(event, arg, options) {
		const opts = { rawEvent: false, serialize: true, trackSharedObject: true, ...options }
		const name = opts.rawEvent ? event : `${this.#suffix}:${event}`
		let val = arg
		if (opts.serialize) {
			val = this._serializeDataIPC(arg, opts)
		}

		for (const c of this.#clients.values()) {
			c.reply(name, val)
		}
		// console.log(`IPC | Broadcasted ${name} to ${this.#clients.size} clients`)
	}
	
	toString() {
		return `IPCHelper#${this.#id}`
	}
}

export class Extension extends EventEmitter {
	#ipc = null

	static #instances = []
	static #oauth = {}

	constructor(o) {
		super()
		this.#ipc = new IPCHelper(this.constructor.extension.name)
		if (typeof o === 'object' && o.id) {
			this.id = o.id
		} else {
			this.id = ((new Date()).getTime()).toString(36) + '.' + Math.floor(Math.random() * 10000).toString(32)
		}
		if (typeof o === 'object' && o.config) {
			if (o.config.$sid) {
				// Saved config
				this.$config = SharedObject.fromJSON(o.config, this.constructor.JSON_CLASSES)
			} else {
				// Default config
				this.$config = new SharedObject(o.config)
			}
		} else {
			this.$config = new SharedObject()
		}
		this.$data = new SharedObject()
		this.$config.on('update', (e) => {
			this.emit('save', {
				id: this.id,
				extension: this.constructor.extension.name,
				config: this.$config,
				type: 'intern',
			})
		})
		this.$config.on('update:extern', (e) => {
			this.emit('save', {
				id: this.id,
				extension: this.constructor.extension.name,
				config: this.$config,
				type: 'extern',
			})
		})

		Extension.#instances.push(this)
	}
	/**
	 * @type {IPCHelper}
	 */
	get $ipc() { return this.#ipc }
	
	destroy() {
		this.#ipc.destroy()
	}
	static get $ipc() {
		if (!this._ipc) {
			this._ipc = new Map()
		}
		if (!this._ipc.get(this)) {
			this._ipc.set(this, new IPCHelper(this.extension.name))
		}
		return this._ipc.get(this)
	}
	static destroy() {
		this.$ipc.destroy()
		for (const ext of this.#instances) {
			ext.destroy()
		}
	}
	static async removeCookies(options) {
		const cookies = await session.defaultSession.cookies.get(options)
		for (const c of cookies) {
			await session.defaultSession.cookies.remove('https://' + c.domain + c.path, c.name)
		}
	}

	/**
	 * 
	 * @param {string} url
	 * @param options 
	 */
	static oauth(url, options) {
		return new Promise((resolve) => {
			const opts = Object.assign({ tryOnly: false, window: {} }, options)
			// 
			const params = new URLSearchParams((new URL(url)).search)
			const redirect = opts.redirect_uri || params.get('redirect_uri')
			if (!redirect) {
				throw new Error(`You must specify the 'redirect_uri' in options.`)
			}
			const oauth = this.#oauth[redirect] || {
				callbacks: {},
				init: false,
				listener: function(details, ret) {
					const url = new URL(details.url)
					const search = new URLSearchParams(url.search)
					let callback = null
					if (search.state && oauth.callbacks[search.state]) {
						callback = oauth.callbacks[search.state]
						delete oauth.callbacks[search.state]
					} else if (Object.values(oauth.callbacks).length === 1) {
						callback = Object.values(oauth.callbacks).pop()
						oauth.callbacks = {}
					}
					if (callback) {
						const { resolve, window } = callback
						const url = new URL(details.url)
						const hash = new URLSearchParams(url.hash ? url.hash.replace('#', '') : '')
						const search = new URLSearchParams(url.search)
						const o = Array.from(hash.keys()).length ? hash : search
						const data = { }
						for (const p of o) {
							data[p[0]] = p[1]
						}
						resolve({ data, url })
						window.close()
					}
					ret({ cancel: true })
				}
			}
			if (!oauth.init) {
				oauth.init = true
				session.defaultSession.webRequest.onBeforeRequest({ urls: [redirect + '*'] }, oauth.listener)
				session.defaultSession.webRequest.onHeadersReceived({ urls: [url + '*'] }, (details, ret) => {
					const location = details.responseHeaders['location'] ? [ ...details.responseHeaders['location']].pop() : ''
					if (!location.startsWith(redirect) && !opts.tryOnly) {
						const url = new URL(details.url)
						const search = new URLSearchParams(url.search)
						const state = search.get('state')
						const { window } = oauth.callbacks[state]
						window.show()
					}
					ret({})
				})
			}
			const state = Extension.generateId()
			const window = new BrowserWindow({ 
				width: opts.window.width || 550,
				height: opts.window.height || 700,
				show: false,
			})
			oauth.callbacks[state] = { resolve, window }
			window.webContents.on('did-finish-load', () => {
				if (opts.window.css) {
					window.webContents.insertCSS(opts.window.css)
				}
			})
			window.loadURL(url + "&state=" + state)
		})
	}
	static generateId() {
		return (new Date()).getTime().toString(36) + Math.ceil(Math.random() * 100000).toString(36)
	}
}
