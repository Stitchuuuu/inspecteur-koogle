(() => {
	const IS_DEV = process.env.ENV !== 'production'
	if (IS_DEV) {
		window.simulateCaptcha = function(filled) {
			window.localStorage.setItem('debug-captcha-feature', filled ? '1' : '0')
			if (filled) {
				window.location = 'https://www.google.fr/search'
			} else {
				window.location.reload()
			}
		}
	}
	const $ipc = require('electron').ipcRenderer
	const $log = (...args) => {
		$ipc.send('main:log', JSON.parse(JSON.stringify(args)))
	}
	/**
	 * Get the current search results for the word
	 * @returns 
	 */
	function getSearchResults() {
		const reg = /([0-9\s]+).+\(([0-9,]+[0-9,]).+\)/i
		const noResults = document.querySelector("#topstuff [role=heading]")
		let total = 0
		let seconds = 0
		if (noResults && noResults.textContent.indexOf('Aucun') >= 0) {
			total = 0
		} else {
			[, total, seconds] = reg.exec(document.querySelector('#result-stats').textContent)
			console.log(total.trim().replace(/ /g, ''))
			total = parseFloat(total.trim().replace(/\s/g, ''))
		}
		return { total, seconds: parseFloat(seconds.toString().replace(',', '.')) }
	}
	
	async function clickOn(el, { delay } = { delay: 0 }) {
		function waitForClick(el) {
			return new Promise(resolve => {
				// $log('$clickOn | wait for click on :', el.outerHTML.substr(0, 32))
				el.addEventListener('click', resolve, { once: true })
			})
		}
		if (delay) {
			await new Promise(resolve => setTimeout(resolve, delay))
		}
		if (typeof el === 'string') {
			el = document.querySelector(el)
		}
		if (!el) return
		el.scrollIntoView()
		await new Promise((resolve, reject) => setTimeout(() => {
			const { x, y } = el.getBoundingClientRect()
			const pos = { x, y }
			// setCursorPosition(pos)
			waitForClick(el).then(resolve)
			setTimeout(() => {
				reject()
			}, 2000)
			debuglog('IPC | click:', pos)
			$ipc.send('click', pos)
		}, 20))
	}
	let cursor = null
	
	function setCursorPosition(position) {
		if (!cursor) {
			cursor = document.createElement('div')
			cursor.id = "fake-mouse-cursor"
			const css = document.createElement('style')
			css.innerHTML = `#fake-mouse-cursor {
				position: fixed;
				display: block;
				z-index: 1000;
				height: 10px;
				background-color: red;
				width: 10px;
				border-radius: 100px;
				/* border: 10px solid red; */
				z-index: 9999;
				box-sizing: border-box;
			}`
			document.body.appendChild(css)
			cursor.style.top = position.y + 'px'
			cursor.style.left = position.x + 'px'
			document.body.appendChild(cursor)	
		} else {
			cursor.style.top = position.y + 'px'
			cursor.style.left = position.x + 'px'
		}
	}
	function debuglog(...args) {
		console.debug.apply(console, args)
	}
	document.addEventListener('DOMContentLoaded', async() => {
		$ipc.send('google:init')
		debuglog('IPC | Sent google:init')
		if (document.querySelector('[role="dialog"] iframe[src*="consent.google."]') || document.querySelector('[role="dialog"] a[href*="policies.google."]')) {
			$ipc.send('google:consent-window')
			window.location = 'https://consent.google.com/d?gl=FR&m=0&pc=shp&uxe=4530818&hl=fr&src=2&continue=http://google.fr'
			return
		} else if (window.location.hostname.indexOf('consent.google') >= 0) {
			debuglog('IPC | Consent Google ?')
			// Consent window, we disable everything then we submit
			const disableButtons = document.querySelectorAll(`button[aria-label^="Désactiver"]`)
			for (const [i, btn] of disableButtons.entries()) {
				try {
					await clickOn(btn, { delay: i ? 500 : 0 })
				} catch (err) {
					console.error('Could not click on', btn)
				}
			}
			const submit = document.querySelector('form button')
			clickOn(submit, { delay: 500 })
			return
		} else if (!document.querySelector('#captcha-form')) {
			// $log('Renderer | No captcha')
			// Testing if there's a search
			let search = window.location.search
			if (window && window.localStorage && window.localStorage.getItem('debug-captcha-feature') === '0') {
				debuglog('Simulating captcha')
				search = false
			} else if (search) {
				const listParams = search.substr(1).split('&')
				const params = { }
				for (const p of listParams) {
					const [name, value] = p.split('=')
					params[decodeURIComponent(name)] = decodeURIComponent(value)
				}
				// $log('Renderer | Params', params)
				if (params.q) {
					// $log('Renderer | Search results', params)
					const results = {
						...getSearchResults(),
						search: params.q,
					}
					debuglog('IPC | Sent google:results', results)
					$ipc.send('google:results', results)
					$ipc.send('google:search')
				} else {
					search = false
				}
			}
			if (!search) {
				// $log('Renderer | google:ready')
				if (window && window.localStorage && window.localStorage.getItem('debug-captcha-feature') === '0') {
					debuglog('google:captcha')
					$ipc.send('google:captcha')
				} else {
					debuglog('google:ready')
					$ipc.send('google:ready')
				}
			}
			$ipc.on('search', (e, text) => {
				debuglog('IPC | Recieved search:', text)
				if (!~window.location.hostname.indexOf('google.fr')) {
					window.location = 'https://www.google.fr/search?q=' + encodeURIComponent(text) + '&tbs=' + encodeURIComponent('li:1')
				} else {
					const input = document.querySelector('input[type=text]')
					input.value = text
					// $log('Search event ?', text)
					setTimeout(() => {
						// $log('Submit ?')
						input.closest('form').submit()
						setTimeout(() => {
							// $log('Must reload ? No submit ?')
							window.location = 'https://www.google.fr/search?q=' + encodeURIComponent(text) + '&tbs=' + encodeURIComponent('li:1')
						}, 1000)
					}, 100)
				}
			})	
		} else {
			$ipc.send('google:captcha')
		}
	})
})()