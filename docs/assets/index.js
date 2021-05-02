const axios = window.axios

var $app = Vue.createApp({
	data: () => ({
		loading: true,
		loadingRelease: true,
		animateRelease: true,
		release: {
			macOSIntel: null,
			macOSApple: null,
			windows: null,
		},
		showBraveModal: false,
		showBatPopover: false,
		installType: '',
		downloadType: 'other',

		isBrave: false,
		timeoutPopover: -1,

		modalImageStyle: {
			width: '',
			height: '',
		},
		modal: {
			brave: false,
			image: false,
			
		}
	}),
	methods: {
		clickOnBat() {
			if (this.isBrave) {
				this.showBatPopover = true
				clearTimeout(this.timeoutPopover)
				this.timeoutPopover = setTimeout(() => {
					this.timeoutPopover = -1
					this.showBatPopover = false
				}, 7000)
			} else {
				this.modal.brave = true
			}
		},
		clearModal() {
			for (const n of Object.keys(this.modal)) {
				this.modal[n] = false
			}
		},
		showImage(e) {
			const target = e.target
			const percent = 0.7
			let width = target.naturalWidth
			let height = target.naturalHeight
			if (height >= width) {
				let ratio = height / width
				height = window.innerHeight*percent
				width = height / ratio
				if (width > window.innerWidth*percent) {
					width = window.innerWidth*percent
					height = width * ratio
				}
			} else if (width > height) {
				let ratio = width / height
				width = window.innerWidth*percent
				height = width / ratio
				if (height > window.innerHeight*percent) {
					height = window.innerHeight*percent
					width = height * ratio
				}
			}
			this.modalImageStyle.width = width + 'px'
			this.modalImageStyle.height = height + 'px'
			this.modal.image = target.getAttribute('src')
		},
		async getLastRelease() {
			await axios.get('https://api.github.com/repos/stitchuuuu/inspecteur-koogle/releases').then((res) => {
				if (res.data.length) {
					res.data.filter(r => !r.draft && !r.prerelease).some((r) => {
						if (this.release.macOSApple && this.release.macOSIntel && this.release.windows) return true
						for (const asset of r.assets) {
							var name = null
							if (asset.name.endsWith('Setup.exe') && !this.release.windows) {
								name = 'windows'
							} else if (asset.name.endsWith('.dmg') && asset.name.indexOf('MacOS-Apple-Silicon') && !this.release.macOSApple) {
								name = 'macOSApple'
							}	else if (asset.name.endsWith('.dmg') && asset.name.indexOf('MacOS-Intel') && !this.release.macOSIntel) {
								name = 'macOSIntel'
							}
							if (name) {
								this.release[name] = { version: r.tag_name, url: asset.browser_download_url }
							}
						}
					})
				}
			})
		}
	},
	computed: {
		modalExists() {
			return Object.values(this.modal).some(v => !!v)
		}
	},
	mounted() {
		this.isBrave = !!navigator.brave
		switch (navigator.platform) {
			case 'MacIntel':
				if (!navigator.userAgent.match(/OS X 10_([789]|1[01234])/)) {
					this.downloadType = 'mac'
					var w = document.createElement("canvas").getContext("webgl")
					var d = w.getExtension('WEBGL_debug_renderer_info')
					var g = d && w.getParameter(d.UNMASKED_RENDERER_WEBGL) || ""
					if (!g.match(/Apple/)) {
						this.downloadType = 'macIntel'
					} else if (g.match(/Apple/) && !g.match(/Apple GPU/)) {
						this.downloadType = 'macApple'
					}
				} else {
					this.downloadType = 'macIntel'
				}
				break
			case 'Win32':
				this.downloadType = 'windows'
				break
		}
		let t
		let loadTimeout = -1
		this.getLastRelease().finally(() => {
			clearTimeout(loadTimeout)
			if (!this.loading) {
				setTimeout(() => {
					this.loading = false
					this.loadingRelease = false
				}, 500 - (Date.now() - t))	
			} else {
				this.animateRelease = false
				this.loadingRelease = false
				this.loading = false
			}
		})
		loadTimeout = setTimeout(() => {
			t = Date.now()
			loadTimeout = -1
			this.loading = false
		}, 50)
	}
}).mount('#app')