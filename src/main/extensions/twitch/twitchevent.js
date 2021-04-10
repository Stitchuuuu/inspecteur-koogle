import sharedobject from '@common/sharedobject.js'

const { SharedObject } = sharedobject

function dateFromUserstate(data) {
	const ms = parseFloat(data['tmi-sent-ts'])
	const timezone = (new Date()).getTimezoneOffset()
	const dt = new Date(ms + (-1 * timezone * 60 * 1000))
	return dt
}
function dateFromTwitchAPI(d) {
	const dt = new Date(d)
	const timezone = (new Date()).getTimezoneOffset()
	dt.setMinutes(dt.getMinutes() - timezone)
	return dt
}

export default class TwitchEvent extends SharedObject {
	type = 'event'
	read = false
	at = new Date()

	toChannel = ''
	toChannelID = ''

	fromUser = ''
	fromUserID = ''

	// subscription
	plan = ''
	planName = ''
	planIsPrime = false
	planMonths = 0

	// message (donation too)
	message = ''

	// donation
	bits = 0

	// raids/hosts
	viewers = 0
	autohost = false

	$data = {}
	constructor(o) {
		super(false)
		return super.share(o)
	}

	get displayName() { return this.$data['display-name'] }
	get username() { return this.fromUser }
	get userId() { return this.fromUserID }
	get color() { return this.$data.color }
	get messageID() {
		return this.$data.id
	}
	get self() {
		return this.$data.self
	}
	get messageHTML() {
		if (!this.$data['emotes']) return this.message
		let mes = this.message
		let emotes = {}
		let html = ''
		for (const id in this.$data['emotes']) {
			for (const pos of this.$data['emotes'][id]) {
				const [start, end] = pos.split('-')
				emotes[parseInt(start)] = { length: parseInt(end) - parseInt(start), id, end: parseInt(end) }
			}
		}
		for (let i = 0; i < mes.length; i++) {
			if (emotes[i]) {
				const emote = emotes[i]
				html += `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/2.0"/>`
				i += emote.length
			} else {
				html += mes[i]
			}
		}
		return html
	}
	get onlyEmotes() {
		if (!this.$data['emotes']) return false
		const mes = this.message
		let emotes = {}
		let text = ''
		for (const id in this.$data['emotes']) {
			for (const pos of this.$data['emotes'][id]) {
				const [start, length] = pos.split('-')
				emotes[parseInt(start)] = { length: parseInt(length), id }
			}
		}
		for (let i = 0; i < mes.length; i++) {
			if (emotes[i]) {
				i += emotes[i].length
			} else {
				text += mes[i]
			}
		}
		return text.trim().length === 0
	}
	get hasEmotes() {
		return !!this.$data['emotes']
	}
	get nbEmotes() {
		if (!this.$data['emotes']) return 0
		let nb = 0
		for (const id in this.$data['emotes']) {
			nb += this.$data['emotes'][id].length
		}
		return nb
	}

	static fromTmiJS_Raided(channelID, channelName, username, viewers) {
		return new this({
			type: 'raid',
			toChannel: channelName, 
			toChannelID: channelID,
			at: new Date(),
			fromUser: username,
			viewers,
			$data: {}
		})
	}

	static fromTmiJS_Hosted(channelID, channelName, username, viewers, autohost) {
		return new this({
			type: 'host',
			toChannel: channelName, 
			toChannelID: channelID,
			at: new Date(),
			fromUser: username,
			viewers,
			autohost: !!autohost,
			$data: {}
		})
	}

	static fromTmiJS_Cheer(channelID, channelName, message, data) {
		return new this({
			type: 'cheer',
			toChannel: channelName, 
			toChannelID: channelID,
			at: dateFromUserstate(data),
			fromUser: data['username'],
			fromUserID: data['user-id'],
			message,
			bits: data.bits,
			$data: data,
		})
	}
	static fromTmiJS_Message(channelID, channelName, message, data) {
		return new this({
			type: 'message',
			toChannel: channelName, 
			toChannelID: channelID,
			at: dateFromUserstate(data),
			fromUser: data['username'],
			fromUserID: data['user-id'],
			message,
			$data: data,
		})
	}
	static fromTmiJS_Subscription(channelID, channelName, methods, data) {
		return new this({
			type: 'subscription',
			toChannel: channelName, 
			toChannelID: channelID,
			at: new Date(parseFloat(data['tmi-sent-ts'])),
			fromUser: data['login'],
			fromUserID: data['user-id'],
			plan: methods.plan,
			planName: methods.planName,
			planMonths: typeof (data['msg-param-multimonth-duration']) === 'boolean' ? 1 : parseInt(data['msg-param-multimonth-duration']),
			planIsPrime: methods.prime,
			$data: data,
		})
	}
	static fromTwitchAPI_Follows(data) {
		return new this({
			type: 'follow',
			toChannel: data['to_name'], 
			toChannelID: data['to_id'],
			at: dateFromTwitchAPI(data['followed_at']),
			fromUser: data['from_name'],
			fromUserID: data['from_id'],
			$data: data,
		})
	}
}