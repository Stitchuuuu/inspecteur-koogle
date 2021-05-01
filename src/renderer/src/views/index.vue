<template>
  <div class="home" :class="{'loading': loading, 'loaded': loaded}">
	<transition name="fade-y">
		<div v-if="loading" class="loader">
			Loading
		</div>
		<template v-else-if="loaded">
			<div v-if="!audit" class="steps">
				<h1>1. Copie ton texte depuis ton éditeur</h1>
				<h1>2. Colle ton texte ici via <template v-if="isMac"><icon src="@/assets/icons/cmd.svg" /> + V</template><template v-else>Ctrl+V</template></h1>
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
						<ui-button v-if="!allSearching" @click="startSearchAll">
							<template v-if="auditProgress === 1">
								Relancer l'analyse
							</template>
							<template v-else-if="auditProgress > 0">
								Continuer l'analyse
							</template>
							<template v-else>
								Lancer l'analyse
							</template>
						</ui-button>
						<ui-button v-else @click="stopSearchAll" class="loader">Stopper l'analyse</ui-button>
						<ui-button @click="help = true">A l'aide !</ui-button>
					</div>
					<div>
						<ui-button @click="audit = null">Charger un autre texte</ui-button>
					</div>
				</div>
				<div v-if="auditProgress < 1" class="progressbar">
					<div class="progressbar-value" :style="{ width: auditProgressPercent + '%' }"></div>
					<div class="progressbar-text">Analyse complétée à {{ auditProgressPercent }}%</div>
				</div>
				<div>
					Pourcentage plagiat: {{ Number(cheatingPercent * 100).toFixed(2) }} %
				</div>
				<div class="separator"></div>
				<div class="content">
					<h1><span>{{ auditSentences.length }}</span> phrases / partie de phrase à analyser</h1>
					<div>
						<div class="table-actions">
							<ui-button v-if="showAllResults" @click="showAllResults = !showAllResults">Afficher uniquement les « plagiats »</ui-button>
							<ui-button v-else @click="showAllResults = !showAllResults">Afficher tout</ui-button>
							<ui-button v-if="!showIgnored" @click="showIgnored = !showIgnored">Afficher les citations et parties ignorées</ui-button>
							<ui-button v-else @click="showIgnored = !showIgnored">Cacher les citations et parties ignorées</ui-button>
						</div>
						<div v-for="sentence in filteredSentences" :key="sentence.id" class="sentence" :class="{'success': sentence.searchStatus === 'success' && sentence.resultsOnGoogle === 0, 'error': sentence.searchStatus === 'failed' || sentence.resultsOnGoogle > 0, 'ignored': sentence.ignored }">
							<div class="copy" @click="copySentence(sentence)" :class="{'loader': sentence.searchLoading }">
								<template v-if="!sentence.searchLoading"><icon src="@/assets/icons/copy.svg" /></template>
							</div>
							<div class="text" @click="copySentence(sentence)">
								<div>{{ sentence.sentence }}</div>
								<div v-if="sentence.ignored" class="sentence-type">{{ getTypeSentence(sentence.type) }} (ignorée)</div>
							</div>
							<div v-if="sentence.resultsOnGoogle !== null && sentence.resultsOnGoogle > 0" class="results" :class="{'high': sentence.resultsOnGoogle.toString().length > 5, 'veryhigh': sentence.resultsOnGoogle.toString().length > 8}">{{ sentence.resultsOnGoogle }}</div>
							<div class="actions">
								<ui-button @click="toggleIgnore(sentence)" :title="sentence.ignored ? 'Vérifier' : 'Ignorer'">
									<icon v-if="sentence.ignored" src="@/assets/icons/blocked.svg" />
									<icon v-else src="@/assets/icons/checkmark.svg" />
								</ui-button>
								<ui-button @click="testGoogleSearch(sentence)"><icon src="@/assets/icons/search.svg" /></ui-button>
								<ui-button type="link" :external="true" :href="generateGoogleSearchLink(sentence.sentence)"><icon src="@/assets/icons/google.svg" /></ui-button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</transition>
	<transition name="fade-y">
		<div v-if="help" class="help modal-container">
			<div class="modal">
				<div class="modal-title">Aide de l'application</div>
				<div class="modal-content">
					<div>
						Cette application permet d'analyser un texte phrase par phrase et de détecter si ces phrases apparaissent sur Google, afin de se prémunir des logiciels anti-plagiats. 
						La méthode n'étant pas divulgée par ces logiciels, ce test n'est donc pas véridique à 100%, mais permet déjà d'obtenir les phrases trouvables mot à mot sur Google, afin de les modifier.</div>
					<div>
						<span><ui-button>Lancer l'analyse</ui-button></span>
						<span>Permet de lancer l'analyse de toute les phrases</span>
					</div>
					<div>
						<span><ui-button><icon src="@/assets/icons/copy.svg" /></ui-button></span>
						<span>Permet de copier la phrase dans le presse-papier. Tu peux aussi cliquer sur la phrase pour la copier.</span>
					</div>
					<div>
						<span><div class="results">42</div></span>
						<span><span style="text-decoration: line-through">Le sens de la vie</span><br/>Nombre de résultats trouvés sur Google pour la phrase</span>
					</div>
					<div>
						<span><ui-button><icon src="@/assets/icons/search.svg" /></ui-button></span>
						<span>Analyse une phrase en particulier.</span>
					</div>
					<div>
						<span><ui-button><icon src="@/assets/icons/google.svg" /></ui-button></span>
						<span>Ouvre une page avec la recherche Google pour la phrase</span>
					</div>
					<div class="version">
						<span>Développé par <ui-button type="link" :external="true" href="https://twitter.com/StitchuOfficiel">Stitchu</ui-button></span>
						<span>Version {{ appVersion }}</span>
					</div>
				</div>
				<div class="modal-actions">
					<ui-button @click="help = false">
						Ok
					</ui-button>
				</div>
			</div>
		</div>
	</transition>
	<transition name="fade-y">
		<div v-if="modal" class="modal-container">
			<div class="modal">
				<div v-if="modal.title" class="modal-title">{{ modal.title }}</div>
				<div v-if="modal.content" class="modal-content">{{ modal.content }}</div>
				<div v-if="modal.actions" class="modal-actions">
					<ui-button v-for="(action, actionIndex) in modal.actions" :key="actionIndex" @click="action.click">
						{{ action.label }}
					</ui-button>
				</div>
			</div>
		</div>
	</transition>
	<transition name="fade-y">
		<div v-if="notification" class="notification">{{ notification }}</div>
	</transition>
  </div>
</template>

<script>
import uiButton from '@/components/button'
import icon from '@/components/icon'

export default {
	name: 'Home',
	data: () => ({
		isMac: false,
		audit: null,
		appVersion: '',

		loading: false,
		loaded: false,
		loadingText: false,
		error: null,
		notification: null,
		allSearching: false,
		modal: null,
		showAllResults: true,
		showIgnored: false,
		help: false,
	}),
	computed: {
		cheatingPercent() {
			const allWordsWithCheating = this.audit.sentences.filter(s => s.searchStatus !== 'none' && s.resultsOnGoogle > 0).reduce((v, s) => s.words + v, 0)
			const allWords = this.audit.sentences.reduce((v, s) => s.words + v, 0)
			return allWordsWithCheating / allWords
		},
		filteredSentences() {
			return this.audit.sentences.filter(s => this.showIgnored || !s.ignored).filter(s => this.showAllResults || s.resultsOnGoogle > 0)
		},
		auditProgress() {
			const sentences = this.auditSentences.length
			const sentencesAudited = this.auditSentences.filter(s => s.resultsOnGoogle >= 0 && s.searchStatus !== 'none').length
			return sentencesAudited / sentences
		},
		auditProgressPercent() {
			return this.auditProgress >= 1 ? '100' : Number(this.auditProgress * 100).toFixed(2)
		},
		auditSentences() {
			return this.audit.sentences.filter(s => !s.ignored)
		}
	},
	methods: {
		toggleIgnore(sentence) {
			sentence.ignored = !sentence.ignored
			this.$server.invoke('sentence:ignored', sentence.id, sentence.ignored)
			// TODO: Set the ignore into the main process too
		},
		getTypeSentence(type) {
			let res = ''
			switch(type) {
			case 'quote':
				res = 'Citation'
				break
			case 'short':
				res = 'Phrase courte / Titre / Numérotation'
				break
			case 'sentence':
				res = 'Phrase / Partie de phrase'
				break
			}
			return res
		},
		async startSearchAll() {
			this.allSearching = true
			let nextSentenceToSearch = this.auditSentences.find(s => s.resultsOnGoogle === null || s.searchStatus === 'none')
			if (!nextSentenceToSearch) {
				for (const s of this.auditSentences) {
					s.resultsOnGoogle = null
					s.searchStatus = 'none'
				}
				this.$server.send('audit:reset')
				nextSentenceToSearch = this.auditSentences.find(s => s.resultsOnGoogle === null || s.searchStatus === 'none')
			}
			while (this.allSearching && nextSentenceToSearch) {
				try {
					await this.testGoogleSearch(nextSentenceToSearch)
					nextSentenceToSearch = this.auditSentences.find(s => s.resultsOnGoogle === null)
				} catch(err) {
					console.error(err)
					this.allSearching = false
					break
				}
			}
			this.allSearching = false
		},
		stopSearchAll() {
			this.allSearching = false
		},
		testGoogleSearch: function(s) { return new Promise((resolve, reject) => {
			s.searchLoading = true
			this.$server.invoke('sentence:googleSearch', {
				id: s.id,
				sentence: s.sentence,
			}).then(data => {
				s.resultsOnGoogle = data.resultsOnGoogle
				s.searchStatus = 'success'
				resolve()
			}).catch(err => {
				console.error(err)
				if (~err.message.toLowerCase().indexOf('captcha')) {
					this.modal = {
						title: 'Anti-bot détecté',
						content: 'Un test anti-bot doit être résolu afin de poursuivre l\'analyse.',
						actions: [{
							label: 'Résoudre le test',
							click: () => {
								this.$server.send('google:show-window')
								this.$server.once('captcha:done', () => {
									this.$server.send('google:hide-window')
									this.modal = null
									setTimeout(() => {
										this.testGoogleSearch(s).then(resolve).catch(reject)
									}, 100)
								})
							},
						}, {
							label: 'Annuler',
							click: () => {
								this.modal = null
								s.searchStatus = 'failed'
								console.error(err)
								reject(err)
							},
						}],
					}
				} else {
					s.searchStatus = 'failed'
				}
			}).finally(() => {
				s.searchLoading = false
			})
		})},
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
			this.isMac = bootData.isMac
			this.appVersion = bootData.version
		}).finally(() => {
			this.loading = false
			setTimeout(() => {
				this.loaded = true
			})
		})
	},
	components: {
		uiButton,
		icon,
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
.progressbar {
	height: 30px;
	width: 100%;
	border: 1px solid #F6AC5E;
	border-radius: 4px;
	position: relative;
	&-value {
		height: 100%;
		display: inline-block;
		background-color: #F6AC5E;
		transition: width 0.1s;
	}
	&-text {
		position: absolute;
		text-align: center;
		width: 100%;
		font-size: 0.8em;
		margin-top: -5px;
	}
	margin-bottom: 30px;
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
.modal-container {
	position: fixed;
	top: 0;
	left: 0;
	height: 100vh;
	width: 100vw;
	background-color: rgba(0,0,0,0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	.modal {
		width: 80vh;
		max-width: 600px;
		padding: 2em;
		background-color: #F6AC5E;
		color: #091044;
		display: flex;
		flex-direction: column;
		&-title {
			font-weight: bold;
			text-transform: uppercase;
		}
		&-content {
			padding: 1em 0;
			flex: 1;
		}
		&-actions {
			display: flex;
			.ui-button {
				background-color: rgba(0,0,0,0.1);
				&:hover {
					background-color: rgba(0,0,0,0.3);
				}
				flex: 1;
				margin-right: 10px;
				&:last-child {
					margin-right: 0;
				}
			}
		}
	}
}
.help {
	.modal-content {
		> div {
			display: flex;
			align-items: center;
			margin-top: 10px;
			span:last-child {
				margin-left: 10px;
			}
			&.version {
				font-size: 0.9em;
				margin-top: 20px;
				justify-content: space-between;
				a.ui-button {
					background-color: transparent;
					text-decoration: underline;
					display: inline;
					padding: 0;
					margin: 0;
					font-size: 1em;
				}
			}
		}
		.ui-button {
			font-size: 0.9em;
			background-color: rgba(0,0,0,0.1);
			&:hover {
				background-color: rgba(0,0,0,0.3);
			}
		}
		.results {
			background-color: rgba(0,0,0,0.1);
			padding: 0.2em;
			font-size: 0.9em;
			width: 44px;
			height: 28px;
			text-align: center;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: bold;
		}
	}
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
		svg {
			height: 1em;
			width: 1em;
			position: relative;
			top: 0.15em;
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
		.separator {
			margin-top: 10px;
			border-bottom: 4px solid rgba(0, 0, 0, 0.9);
		}
		.content {
			text-align: left;
			overflow-y: auto;
			flex: 1;
			width: 100%;
			box-sizing: border-box;
			padding-bottom: 2em;
		}
		.table-actions {
			.ui-button {
				margin-right: 10px;
				&:last-child {
					margin-right: 0;
				}
			}
			margin-bottom: 20px;
		}
		> .actions {
			display: flex;
			justify-content: space-between;
			.ui-button {
				margin-right: 10px;
				&:last-child {
					margin-right: 0;
				}
			}
			padding-bottom: 1em;
		}
	}
}
.sentence {
	background-color: #f6ac5e;
	color: #091044;
	&.success {
		background-color: #3F910C;
	}
	&.error {
		background-color: #451E10;
		color: white;
		.ui-button {
			color: white;
		}
	}
	&.ignored {
		background-color: rgba(0, 0, 0, 0.5);
		color: #999999;
		.ui-button {
			color: #999999;
		}
	}
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
	&-type {
		font-style: italic;
		font-size: 0.8em;
	}
	.copy {
		cursor: pointer;
		width: 20px;
		&.loader::after {
			height: 12px;
			width: 12px;
			margin-left: 0;
		}
	}
	.results {
		background-color: rgba(0,0,0,0.1);
		padding: 0.2em;
		font-size: 0.9em;
		width: 60px;
		height: 28px;
    text-align: center;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
		&.high {
			font-size: 0.7em;
		}
		&.veryhigh {
			font-size: 0.5em;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			text-align: left;
		}
	}
	.actions {
		font-size: 0.75em;
		display: flex;
		align-items: center;
		justify-content: center;
		.ui-button {
			margin-right: 5px;
			display: inline-block;
			background-color: rgba(0, 0, 0, 0.1);
			&:hover {
				background-color: rgba(0, 0, 0, 0.3);
			}
			svg {
				height: 1em;
				width: 1em;
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