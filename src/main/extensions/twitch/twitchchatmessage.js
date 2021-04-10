import sharedobject from '@common/sharedobject.js'

const { SharedObject } = sharedobject

export default class TwitchChatMessage extends SharedObject {

	get displayName() { return this.$tmi['display-name'] }
	get username() { return this.$tmi.username }
	get userId() { return this.$tmi['user-id'] }
	get color() { return this.$tmi.color }
	get message() { return this.$tmi.message }
	get id() { return this.$tmi.id }
	get sentAt() { return new Date(parseFloat(this.$tmi['tmi-sent-ts'])) }

	static fromTmiJS(mes) {
		return new this({ $tmi: mes })
	}
}