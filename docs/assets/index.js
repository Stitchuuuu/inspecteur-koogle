var $app = Vue.createApp({
	data: () => ({
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
				if (navigator.userAgent.match(/OS X 10_([789]|1[01234])/)) {
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
			case 'win32':
				this.downloadType = 'windows'
				break
		}
	}
}).mount('#app')