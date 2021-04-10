process.once('loaded', () => {
	global.require = require
	const log = (...args) => {
		require('electron').ipcRenderer.send('main:log', ...args)
	}
	global.log = log

	const { remote } = require('electron')
	const win = remote.getCurrentWindow()
	if (win.isAlwaysOnTop()) {
		const setIgnoreMouseEvents = require('electron').remote.getCurrentWindow().setIgnoreMouseEvents
		// const focus = require('electron').remote.getCurrentWindow().focus
		window.addEventListener('mousemove', event => {
			if (event.target === document.documentElement) {
				setIgnoreMouseEvents(true, {forward: true})
			} else {
				setIgnoreMouseEvents(false)
			}
		})	
	}
})