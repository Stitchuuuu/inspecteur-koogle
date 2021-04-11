<template>
  <div class="home" :class="{'loading': loading, 'loaded': loaded}">
	<transition name="fade-y">
		<div v-if="loading" class="loader">
			Loading
		</div>
		<template v-else-if="loaded">
			<div v-if="!audit" class="steps">
				<h1>1. Copie ton texte depuis ton éditeur</h1>
				<h1>2. Colle ton texte ici via Cmd+V ou Ctrl+V</h1>
				<transition name="fade-y">
					<div v-if="loadingText" class="notice loader">Analyse du texte en cours</div>
				</transition>
				<transition name="fade-y">
					<div v-if="error" class="notice error">{{ error }}</div>
				</transition>
			</div>
			<div v-else class="audit">
				<div class="actions">
					<div>
						<ui-button>Afficher le texte</ui-button>
						<ui-button>Lancer l'analyse</ui-button>
					</div>
					<div>
						<ui-button @click="audit = null">Charger un autre texte</ui-button>
					</div>
				</div>
				<div class="content">
					<h1><span>{{ audit.quotes.length }}</span> citations trouvées</h1>
					<h1><span>{{ audit.sentences.length }}</span> phrases / partie de phrase trouvées</h1>
					<div>
						<div v-for="sentence in audit.sentences" :key="sentence.id" class="sentence">
							<div class="copy" @click="copySentence(sentence)">C</div>
							<div class="text" @click="copySentence(sentence)">{{ sentence.sentence }}</div>
							<div v-if="sentence.resultsOnGoogle !== null" class="results">{{ sentence.resultsOnGoogle }}</div>
							<div class="actions">
								<ui-button>T</ui-button>
								<ui-button type="link" :external="true" :href="generateGoogleSearchLink(sentence.sentence)">G</ui-button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</transition>
	<transition name="fade-y">
		<div v-if="notification" class="notification">{{ notification }}</div>
	</transition>
  </div>
</template>

<script>
import uiButton from '@/components/button'

export default {
	name: 'Home',
	data: () => ({
		loading: false,
		loaded: false,
		loadingText: false,
		error: null,
		audit: null,
		notification: null,
	}),
	methods: {
		async copySentence(s) {
			await navigator.clipboard.writeText(s.sentence)
			this.pushNotification('Le texte a été copié !')
		},
		pushNotification(text) {
			clearTimeout(this._notification_timeout)
			this.notification = text
			this._notification_timeout = setTimeout(() => {
				this.notification = ''
			}, 2000)
		},
		generateGoogleSearchLink(text) {
			const t = `"${text}"`
			const params = `q=` + encodeURIComponent(t) + '&tbs=' + encodeURIComponent('li:1')
			return `https://www.google.fr/search?` + params
		},
		async onPasteData(e) {
			this.error = null
			this.loadingText = true
			const clipboardData = e.clipboardData || window.clipboardData
			const text = ~clipboardData.types.indexOf('text/html') ? clipboardData.getData('text/html') : undefined
			const rawText = clipboardData.getData('text')
			if (!text || rawText.length < 50) {
				this.loadingText = false
				this.error = `Impossible d'obtenir le texte de ton presse-papier. Es-tu sûr d'avoir copié/collé un texte et pas un fichier ?`
			} else {
				this.audit = await this.$server.invoke('text:parse', {
					text: rawText,
					html: text,
				})
			}
		},
	},
	mounted() {
		this._notification_timeout = -1
		document.addEventListener('paste', (e) => this.onPasteData(e))
		this.$server.invoke('boot').then((bootData) => {
			this.audit = bootData.currentAudit
		}).finally(() => {
			this.loading = false
			setTimeout(() => {
				this.loaded = true
			})
		})
	},
	components: {
		uiButton,
	},
}
</script>

<style lang="scss">
.fade-y-enter-from,
.fade-y-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-y-enter-active,
.fade-y-leave-active {
  transition: opacity 0.3s, transform 0.5s;
}
.fade-y-leave-active {
	position: absolute;
}

body {
	background-color: #091044;
	color: #F6AC5E;
}
svg {
	fill: #F6AC5E;
}
.notification {
	position: fixed;
	bottom: 0;
	left: 0;
	padding: 0.5em 1em;
	height: 2em;
	display: flex;
	align-items: center;
	background-color: green;
	color: white;
	width: 100%;
}
.home {
	.steps {
		flex: 1;
		text-align: left;
		padding: 20px;
		.notice {
			color: #091044;
			display: flex;
			font-size: 20px;
			padding: 10px;
		}
		.loader {
			background-color: #f6ac5e;
			color: #091044;
			text-align: center;
			&:after {
				margin-left: 10px;
				height: 24px;
				width: 24px;
			}
		}
		.error {
			background-color: #A86E2F;
		}
	}
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100vh;
	&.loaded {
		text-align: left;
		align-items: flex-start;
		justify-content: flex-start;
		padding: 1em 3em;
		padding-bottom: 0;
		box-sizing: border-box;
	}
	overflow: hidden;
	.audit {
		display: flex;
		flex-direction: column;
		height: 100%;
		flex: 1;
		.content {
			text-align: left;
			overflow-y: auto;
			flex: 1;
			width: 100%;
			box-sizing: border-box;
			padding-bottom: 2em;
		}
		> .actions {
			display: flex;
			justify-content: space-between;
			.ui-button {
				margin-right: 10px;
			}
			padding-bottom: 1em;
		}
	}
}
.sentence {
	background-color: #f6ac5e;
	color: #091044;
	padding: 10px;
	display: flex;
	align-items: center;
	margin-top: 5px;
	> div {
		margin-right: 10px;
		&:last-child {
			margin-right: 0;
		}
	}
	.text {
		flex: 1;
		cursor: pointer;
	}
	.copy {
		cursor: pointer;
	}
	.actions {
		font-size: 0.75em;
		.ui-button {
			margin-right: 5px;
			background-color: rgba(0, 0, 0, 0.1);
			&:hover {
				background-color: rgba(0, 0, 0, 0.3);
			}
		}
	}
}
.loader {
	display: inline-flex;
	align-items: center;
	justify-content: center;
}
.loader:after {
	content: '';
	background-size: cover;
	display: inline-block;
	height: 16px;
	width: 16px;
    animation:spin 1s linear infinite;
	border-radius: 999px;
	border: 1px solid currentColor;
	border-top: 0;
	border-left: 0;
	margin-left: 7px;
}
@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }

</style>