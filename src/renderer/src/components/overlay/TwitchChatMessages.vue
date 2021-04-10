<template>
  <div class="twitch-chat-messages">
    <div v-for="message of unreadMessages" :key="message.id">
			{{ message.displayName }}: {{ message.message }}
		</div>
  </div>
</template>

<script>
export default {
	name: 'twitch-chat-messages',
	data() {
		return {
			messages: [],
		}
	},
	props: {
		data: {
			type: Object,
			required: false,
			default: () => ({})
		}
	},
	mounted() {
		this.$server.invoke('twitch:chat:last').then((messages) => {
			for (const m of messages) {
				this.messages.push(m)
			}
		}).catch(e => {
			console.error(e)
		})
		this.$server.on('twitch:chat:message', (message) => {
			this.messages.push(message)
		})
	},
	computed: {
		unreadMessages() {
			return this.messages.slice().sort((a, b) => {
				return a.sentAt > b.sentAt ? 1 : (a.sentAt < b.sentAt ? -1 : 0)
			})
		}
	}
}
</script>

<style scoped lang="scss">
.twitch-chat-messages {
  min-height: 300px;
	background-color: cyan;
}
</style>
