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
				</div>
			</div>
		</template>
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
	}),
	methods: {
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
		}
		.actions {
			display: flex;
			justify-content: space-between;
			.ui-button {
				margin-right: 10px;
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