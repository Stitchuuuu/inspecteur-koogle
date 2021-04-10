<template>
  <div class="twitch-events-list">
		<div v-if="raids.length" class="twitch-events twitch-events-raids" :class="{'full': showFull.raids }" @click="showFull.raids = !showFull.raids">
			<div class="twitch-events-container">
				<span class="twitch-events-container_icon-and-total">
					<icon src="@/assets/icons/raid.svg" height="24" width="24"/>
					<span v-if="raids.length">{{ raids.length >= 999 ? '999+' : raids.length }}</span>
				</span>
				<div>
					<div v-for="raid in raids" :key="raid.$sid" class="twitch-events-container_message">
						<div class="message">
							{{ raid.fromUser }} a lancé un raid de {{ raid.viewers }} viewers.
						</div>
						<div class="footer">
							<span></span>
							<span>{{ timeElapsedUntil(raid.at) }}</span>
						</div>
					</div>
				</div>
			</div>
			<div class="close" @click.stop.prevent="setRead(raids)">x</div>
		</div>
		<div v-if="cheers.length" class="twitch-events twitch-events-cheers" :class="{'full': showFull.cheers }" @click="showFull.cheers = !showFull.cheers">
			<div class="twitch-events-container">
				<span class="twitch-events-container_icon-and-total">
					<icon src="@/assets/icons/cheer.svg" height="24" width="24"/>
					<span v-if="cheers.length">{{ cheers.length >= 999 ? '999+' : cheers.length }}</span>
				</span>
				<div>
					<div v-for="cheer in cheers" :key="cheer.$sid" class="twitch-events-container_message">
						<div class="message">
							{{ cheer.fromUser }} a fait un don de {{ cheer.bits }} (~${{ Number(cheer.bits/100).toFixed(2) }}).
						</div>
						<div class="footer">
							<span></span>
							<span>{{ timeElapsedUntil(cheer.at) }}</span>
						</div>
					</div>
				</div>
			</div>
			<div class="close" @click.stop.prevent="setRead(follows)">x</div>
		</div>
		<div v-if="follows.length" class="twitch-events twitch-events-follows" :class="{'full': showFull.follows }" @click="showFull.follows = !showFull.follows">
			<div class="twitch-events-container">
				<span class="twitch-events-container_icon-and-total">
					<icon src="@/assets/icons/follow.svg" height="24" width="24"/>
					<span v-if="follows.length">{{ follows.length >= 999 ? '999+' : follows.length }}</span>
				</span>
				<div>
					<div v-for="follow in follows" :key="follow.$sid" class="twitch-events-container_message">
						<div class="message">
							{{ follow.fromUser }} vous a follow.
						</div>
						<div class="footer">
							<span></span>
							<span>{{ timeElapsedUntil(follow.at) }}</span>
						</div>
					</div>
				</div>
			</div>
			<div class="close" @click.stop.prevent="setRead(follows)">x</div>
		</div>
		<div v-if="subs.length" class="twitch-events twitch-events-subs" :class="{'full': showFull.subs }" @click="showFull.subs = !showFull.subs">
			<div class="twitch-events-container">
				<span class="twitch-events-container_icon-and-total">
					<icon src="@/assets/icons/sub.svg" height="24" width="24"/>
					<span v-if="subs.length">{{ subs.length >= 999 ? '999+' : subs.length }}</span>
				</span>
				<div>
					<div v-for="sub in subs" :key="sub.$sid" class="twitch-events-container_message">
						<div class="message">
							<template v-if="sub.planIsPrime">{{ sub.fromUser }} vous a donné un Prime</template>
							<template v-else-if="sub.planMonths <= 1">{{ sub.fromUser }} s'est abonné au tier {{ sub.planName }}</template>
							<template v-else>{{ sub.fromUser }} s'est abonné au tier {{ sub.planName }} avec {{ sub.planMonths }} mois d'affilé !</template>
						</div>
						<div class="footer">
							<span></span>
							<span>{{ timeElapsedUntil(sub.at) }}</span>
						</div>
					</div>
				</div>
			</div>
			<div class="close" @click.stop.prevent="setRead(subs)">x</div>
		</div>
		<div v-if="messages.length" class="twitch-events twitch-events-chat" :class="{'full': showFull.messages }" @click="showFull.messages = !showFull.messages; maxNumberOfMessages = defaultMaxNumberOfMessages">
			<div class="twitch-events-container">
				<span class="twitch-events-container_icon-and-total">
					<icon src="@/assets/icons/chat.svg" height="24" width="24"/>
					<span v-if="messages.length">{{ messages.length >= 999 ? '999+' : messages.length }}</span>
				</span>
				<div>
					<div v-for="message in limitedMessages" :key="message.$sid" class="twitch-chat-message" :style="{'background-color': toRGBA(message.color, 0.5), 'color': getTextColor(message.color)}">
						<div class="title">
							<span class="author">{{ message.displayName }}</span>
							<span class="date">{{ timeElapsedUntil(message.at) }}</span>
						</div>
						<div class="message" v-html="message.messageHTML"></div>
					</div>
					<div v-if="messages.length > maxNumberOfMessages" class="twitch-events-container_button" @click.stop="maxNumberOfMessages += 50">
						Voir plus de messages
					</div>
				</div>
			</div>
			<div class="close" @click.stop.prevent="setRead(messages)">x</div>
		</div>
  </div>
</template>

<script>
import icon from '@/components/icon'

export default {
	name: 'twitch-events',
	data() {
		return {
			currentTime: new Date(),
			events: [],
			showFull: {
				messages: false,
				subs: false,
				follows: false,
				cheers: false,
				raids: false,
			},
			maxNumberOfMessages: 50,
			defaultMaxNumberOfMessages: 50,
		}
	},
	props: {
		data: {
			type: Object,
			required: false,
			default: () => ({})
		}
	},
	methods: {
		toRGBA(hex, opacity) {
			if (!hex) {
				hex = '#000000'
			}
			const reg = /#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i
			const [, r, g, b] = reg.exec(hex.toLowerCase())
			return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${opacity})`
		},
		getTextColor(hex) {
			if (!hex) {
				hex = '#000000'
			}
			const reg = /#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i
			const [, r, g, b] = reg.exec(hex.toLowerCase())
			const brightness = Math.round(((parseInt(r, 16) * 299) +
                      (parseInt(g, 16) * 587) +
                      (parseInt(b, 16) * 114)) / 1000)
			return (brightness > 90) ? 'black' : 'white'
		},
		timeElapsedUntil(dt) {
			const elapsed = (this.currentTime - dt) / 1_000
			const scales = [
				{ type: 'hour', value: 60 * 60 },
				{ type: 'minutes', value: 60 },
				{ type: 'seconds', value: 1 },
			]
			let scale = null
			while (scales.length && !scale) {
				const s = scales.shift()
				if (elapsed > s.value) {
					scale = s
				}
			}
			let s = 'il y a '
			if (scale) {
				const nb = elapsed / scale.value
				const remaining = elapsed % scale.value
				switch (scale.type) {
					case 'hour': {
						s += `${Math.floor(nb)} h`
						const remainingMin = Math.floor(remaining / 60)
						if (remainingMin > 1) s += ` et ${remainingMin} min`
						break
					}
					case 'minutes':
						s += `${Math.floor(nb)} min`
						break
					case 'seconds':
						s += `${Math.floor(nb)} sec`
						break
				}
			} else {
				s = `à l'instant`
			}
			return s			
		},
		setRead(elem) {
			if (Array.isArray(elem)) {
				setTimeout(() => {
					for (const o of elem) {
						if (!o.read) o.read = true
					}
				})
			} else if (typeof elem === 'object' && !elem.read) {
				elem.read = true
			}
		}
	},
	mounted() {
		this.$server.invoke('twitch:events:last', { read: false }).then((events) => {
			this.events = events.slice()
		}).catch(e => {
			console.error(e)
		})
		this.$server.on('twitch:event', (e) => {
			this.events.push(e)
		})
		setInterval(() => {
			this.currentTime = new Date()
		}, 500)
	},
	computed: {
		unread() {
			return this.events.filter(e => !e.read).sort((a, b) => {
				if (a.at > b.at) return 1
				else if (a.at < b.at) return -1
				return 0
			})
		},
		messages() {
			return this.unread.filter(e => e.type === 'message')
		},
		limitedMessages() {
			return this.messages.slice(0, this.maxNumberOfMessages)
		},
		subs() {
			return this.unread.filter(e => e.type === 'subscription')
		},
		follows() {
			return this.unread.filter(e => e.type === 'follow')
		},
		cheers() {
			return this.unread.filter(e => e.type === 'cheer')
		},
		raids() {
			return this.unread.filter(e => e.type === 'raid')
		},
		host() {
			return this.unread.filter(e => e.type === 'host')
		},
	},
  components: {
		icon,
  }
}
</script>

<style lang="scss">
.twitch-events-list {
	overflow: hidden;
}
.twitch-events {
	position: relative;
	&-container {
		display: flex;
		align-items: flex-start stretch;
		justify-content: center;
		position: relative;
		margin: 1em;
		padding: 0.5em 0;
		max-height: 100vh;
		overflow-y: hidden;
		> span {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			
			svg {
				height: 4em;
				width: 4em;
			}
			span {
				background-color: rgba(0,0,0,0.2);
				margin: 0 8px;
				border-radius: 2px;
				margin-top: 15px;
			}
		}
		> div {
			text-align: left;
			flex: 1;
			font-size: 0.8em;
			padding-right: 0.8em;
			overflow-y: hidden;
			max-height: 100px;
			> div {
				background-color: rgba(0,0,0,0.1);
				margin-bottom: 0.2em;
			}
		}
		&_message {
			padding: 0.4em 0.8em;
			.footer {
				text-transform: uppercase;
				font-size: 0.75em;
				display: flex;
				justify-content: space-between;
			}
		}
		&_button {
			padding: 0.4em 0.8em;
			transition: background-color 0.2s;
			cursor: pointer;
			text-align: center;
			&:hover {
				background-color: rgba(0,0,0,0.3);
			}
		}
	}
	&.full .twitch-events-container {
		align-items: flex-start;
		> div {
			overflow-y: auto;
			max-height: calc(100vh - 40px);
		}
	}
	&-chat .twitch-events-container {
		background-color: #00EBE7;
		color: black;
	}
	&-follows .twitch-events-container {
		background-color: #EB980C;
		color: black;
	}
	&-subs .twitch-events-container {
		background-color: #EB1B0C;
		color: black;
	}
	&-cheers .twitch-events-container {
		background-color: #9E6A10;
		color: black;
	}
	.close {
		user-select: none;
		position: absolute;
		top: -5px;
		left: 10px;
		background-color: #eeeeeeee;
		border-radius: 2px;
		color: black;
		display: block;
		height: 24px;
		width: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
}
.twitch-chat-message {
	padding: 0.4em 0.8em;
	.title {
		text-transform: uppercase;
		font-size: 0.75em;
		display: flex;
		justify-content: space-between;
	}
	.message {
		overflow-x: hidden;
		overflow-wrap: break-word;
		> img {
			height: 1em;
			width: 1em;
		}
	}
}
</style>
