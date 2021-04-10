<template>
  <div class="home" :class="{'loading': !loaded}">
		<div v-if="!loaded" class="loader">
			Loading
		</div>
		<template v-else>
			<div class="steps">
				<h1>1. Copie ton texte depuis ton éditeur</h1>
				<h1>2. Colle ton texte ici via Cmd+V ou Ctrl+V</h1>
				<transition name="fade-y">
					<div v-if="loadingText" class="notice loader">Analyse du texte en cours</div>
				</transition>
				<transition name="fade-y">
					<div v-if="error" class="notice error">{{ error }}</div>
				</transition>
			</div>
		</template>
  </div>
</template>

<script>
export default {
	name: 'Home',
	data: () => ({
		loaded: true,
		loadingText: false,
		error: null,
	}),
	methods: {
	},
	mounted() {
		document.addEventListener('paste', (e) => {
			this.error = null
			this.loadingText = true
			const clipboardData = e.clipboardData || window.clipboardData
			const text = ~clipboardData.types.indexOf('text/html') ? clipboardData.getData('text/html') : undefined
			const rawText = clipboardData.getData('text')
			if (!text || rawText.length < 50) {
				this.loadingText = false
				this.error = `Impossible d'obtenir le texte de ton presse-papier. Es-tu sûr d'avoir copié/collé un texte et pas un fichier ?`
			} else {
				console.log(this.$server.send('text:parse', {
					text: rawText,
					html: text,
				}))
			}
		})
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
	align-items: flex-start;
	justify-content: flex-start;	
	height: 100vh;
	overflow: hidden;
	&.loading {
		align-items: center;
		justify-content: center;
	}
	.menu {
		list-style: none;
		padding: 0;
		margin: 0;
		li {
			cursor: pointer;
			border-bottom: 1px solid #f6ac5e;
			padding: 1em;
			background-color: rgba(246, 172, 94, 0.7);
			color: #091044;
			transition: background-color 0.3s;
			&.selected {
				background-color: rgb(246, 172, 94);
			}
			&:hover {
				background-color: rgb(246, 172, 94);
			}
		}
	}
	.content {
		padding: 20px;
		text-align: left;
		overflow-y: auto;
		flex: 1;
		height: 100%;
		box-sizing: border-box;
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