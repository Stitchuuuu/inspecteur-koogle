import { app, BrowserWindow, ipcMain, Menu, session, dialog } from 'electron'
import { platform } from 'os'
import fs from 'fs'
import worker from './worker.js'
import path from 'path'
import { isVersion, getLastVersionFromRemote } from './version.helper'

const pt = platform()
const isMac = pt === 'darwin'
// const isWindows = pt === 'win32'
const isBetaOrAlpha = (~app.getVersion().indexOf('-beta.') || ~app.getVersion().indexOf('-alpha.'))
const isBeta = ~app.getVersion().indexOf('-beta.')
const isAlpha = ~app.getVersion().indexOf('-alpha.')
const APP_WINDOW_NAME = 'Inspecteur Koogle - Détecteur anti-plagiat'

let debugMode = false
let intervalCheckVersion = -1

const IS_DEV = !((app && app.isPackaged) || process.env.NODE_ENV === 'production')
if (!IS_DEV && app && app.isPackaged && !process.env.NODE_ENV) {
	process.env.ENV = 'production'
} else if (!process.env.NODE_ENV) {
	process.env.ENV = 'development'
} else {
	process.env.ENV = process.env.NODE_ENV
}
function show(win, page) {
	if (!page) page = ''
	if (app.isPackaged || process.env.NODE_ENV === 'production') {
		if (page) page = '#' + page
		win.loadURL('file://' + app.getAppPath() + '/renderer/index.html' + page)
	} else {
		win.loadURL('http://localhost:8080/' + page)
	}
}
let applicationGlobalMenu = null
let bounceIDForCaptcha = null

const auditExtensionsFileFilters = [
	{ name: 'Analyse Inspecteur Koogle', extensions: ['json'] },
	{ name: 'Tous les fichiers', extensions: ['*'] },
]

async function checkNewVersion(type) {
	const release = await getLastVersionFromRemote(pckg, isAlpha ? 'alpha' : (isBeta ? 'beta' : ''))
	if (!release) return
	if (isVersion(release.version, '>', app.getVersion())) {
		appWindow && appWindow.$emit('version:new', { ...release, by: type })
	}
}

function applicationMenu() {
	if (applicationGlobalMenu) return applicationGlobalMenu

	const template = [
		...(isMac ? [{
			label: app.name,
			submenu: [
				{ role: 'about', label: 'À propos' },
				{
					id: 'check-for-updates',
					label: 'Vérifier les mises à jour...',
					click: () => {
						checkNewVersion('menu')
					},
				},
				{ type: 'separator' },
				{ role: 'services', label: 'Services' },
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideothers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' },
			],
		}] : []),
		{
			label: 'Fichier',
			submenu: [
				{ 
					id: 'new',
					label: 'Nouveau',
					accelerator: 'CommandOrControl+N',
					click: async() => {
						currentAudit = null
						saveState()
						appWindow && appWindow.$emit && appWindow.$emit('audit:new')
					},
				},
				{ 
					id: 'open-file',
					label: 'Ouvrir',
					accelerator: 'CommandOrControl+O',
					click: async() => {
						const result = await dialog.showOpenDialog({ 
							properties: ['openFile'], 
							filters: auditExtensionsFileFilters,
						})
						if (!result.canceled) {
							openAudit(result.filePaths)
						}
					},
				},
				{
					id: 'save-as',
					label: 'Enregistrer sous',
					accelerator: 'CommandOrControl+Shift+S',
					click: async() => {
						const result = await dialog.showSaveDialog({ 
							properties: ['createDirectory'], 
							filters: auditExtensionsFileFilters,
						})
						if (!result.canceled) {
							saveAuditTo(result.filePath)
						}

					},
				},
				{ 
					id: 'open-and-combine',
					label: 'Combiner',
					click: async() => {
						const result = await dialog.showOpenDialog({ 
							title: 'Choisir plusieurs analyses pour les combiner en une seule',
							properties: ['openFile', 'multiSelections'], 
							filters: auditExtensionsFileFilters,
						})
						if (!result.canceled) {
							openAudit(result.filePaths)
						}
					},
				},
				isMac ? { role: 'close', label: 'Fermer' } : { role: 'quit', label: 'Fermer' },
			],
		},
		{
			label: 'Édition',
			submenu: [
				{ role: 'paste', label: 'Coller' },
			],
		},
		{
			label: 'Afficher',
			submenu: [
				{
					id: 'view-google-window',
					label: 'Afficher la fenêtre Google',
					click: async() => {
						googleClient && googleClient.window.show()
					},
					enabled: !!googleClient,
				},
				{ role: 'reload', label: 'Rafraichir' },
				...((!IS_DEV && !isBetaOrAlpha && !debugMode) ? [] : [
					{ type: 'separator' },
					{ role: 'toggleDevTools' },
				]),
			],
		},
		{
			label: 'Fenêtre',
			submenu: [
				{ role: 'minimize' },
				{ role: 'zoom' },
				...(isMac ? [
					{ type: 'separator' },
					{ role: 'front' },
					{ type: 'separator' },
					{ role: 'window' },
				] : [
					{ role: 'close' },
				]),
				...(debugMode ? [
					{ 
						label: 'Désactiver Debug Mode',
						click: async() => {
							debugMode = false
							reloadMenu()
						},
					}] : [])],
		},
		...(!isMac ? [{ 
			label: 'Extra',
			submenu: [
				{
					id: 'check-for-updates',
					label: 'Vérifier les mises à jour...',
					click: () => {
						checkNewVersion()
					},
				},
			],
		}]: []),
	]
	applicationGlobalMenu = Menu.buildFromTemplate(template)
	return applicationGlobalMenu
}


function createWindow(relativeURL, options) {
	const opts = {
		width: 800,
		height: 640,
		title: APP_WINDOW_NAME,
		...options,
	}
	// Create the browser window.
	const win = new BrowserWindow({
		width: opts.width,
		height: opts.height,
		show: true,
		title: opts.title,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			preload: IS_DEV ?
				path.join(app.getAppPath(), 'src', 'renderer', 'public', 'preload.js') : 
				path.join(app.getAppPath(), 'renderer', 'preload.js'),
		},
		icon: path.join(app.getAppPath(), isMac ? 'assets/rounded-icon.icns' : 'assets/icon.png'),
	})
	win.setMenu(applicationMenu())
	show(win, relativeURL)
	if (IS_DEV) {
		win.openDevTools({ mode: 'detach' })
	}
	win.on('closed', () => {
		appWindow = null
		clearInterval(intervalCheckVersion)
		if (googleClient && googleClient.window) {
			try {
				googleClient.window.close()
			} catch (e) {
				// 
			}
		}
	})
	return win
}
function createGoogleSearchWindow() {
	const win = new BrowserWindow({
		width: 640,
		height: 480,
		show: false,
		title: 'Recherche Google',
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			preload: IS_DEV ?
				path.join(app.getAppPath(), 'src', 'renderer', 'public', 'preload-google.js') : 
				path.join(app.getAppPath(), 'renderer', 'preload-google.js'),
		},
		icon: path.join(app.getAppPath(), isMac ? 'assets/rounded-icon.icns' : 'assets/icon.png'),
	})
	win.on('close', (e) => {
		if (appWindow) {
			e.preventDefault()
			try {
				win.hide()
			} catch (e) {
				// 
			}
			setTimeout(() => {
				if (!appWindow) {
					try {
						win.close()
					} catch (e) {
						// 
					}
				}
			}, 500)
		}
	})
	if (IS_DEV) {
		win.openDevTools({ mode: 'detach' })
	}
	const uri = new URL('https://www.google.fr/search')
	uri.search = new URLSearchParams({
		// Exact search only
		tbs: 'li:1',
	})
	win.loadURL(uri.toString())
	return win
}
let googleClient = null

function AppShowAttention() {
	if (isMac) {
		return app.dock.bounce('critical')
	} else {
		appWindow && appWindow.setProgressBar(1, { mode: 'error' })
		return !!appWindow
	}
}
function AppHideAttention(val) {
	if (isMac && val) {
		app.dock.cancelBounce(val)
	} else if (val) {
		appWindow && appWindow.setProgressBar(-1)
	}
}

function OnGoogleClientReady() {
	if (prGoogleSearchInit) {
		prGoogleSearchInit.resolve()
	}
	OnGoogleClientReadyOrResults()
}
function OnGoogleClientReadyOrResults() {
	if (googleClient.wasCaptchaBefore && googleClient.currentSearch) {
		const cs = googleClient.currentSearch
		if (cs.window) {
			cs.window.show()
			if (cs.emit) {
				cs.emit('captcha:done')
				AppHideAttention(bounceIDForCaptcha)
				bounceIDForCaptcha = false
			}
		}
	} else if (googleClient.wasConsented && googleClient.currentSearch && googleClient.state === 'ready') {
		googleClient.emit('search', googleClient.currentSearch.text)
	}
}

let currentAudit = null

function saveState() {
	const p = path.join(app.getPath('userData'), 'data.json')
	fs.writeFileSync(p, JSON.stringify({
		currentAudit: prepareAuditToSave(currentAudit),
	}, null, 2))
	SetEnableMenuItem('save-as', currentAudit !== null)
}

const loadState = () => ( new Promise((resolve, reject) => {
	const p = path.join(app.getPath('userData'), 'data.json')
	fs.access(p, fs.constants.F_OK, (err) => {
		if (err) return resolve({})
		fs.readFile(p, (err, buffer) => {
			if (err) return reject(err)
			const data = JSON.parse(buffer.toString())
			upgradeAudit(data.currentAudit)
			currentAudit = data.currentAudit
			if (data.currentAudit && data.currentAudit.upgraded) {
				saveState()
			}
			SetEnableMenuItem('save-as', currentAudit !== null)

			resolve(data)
		})
	})
}))

function loadAudit(content) {
	let audit = null
	try {
		audit = JSON.parse(content.toString())
	} catch (err) {
		throw new Error(err)
	}
	upgradeAudit(audit)
	return audit
}
function upgradeAudit(audit) {
	if (audit && audit.sentences && !audit.version) {
		audit.version = app.getVersion()
		for (const s of audit.sentences) {
			s.ignored = s.type !== 'sentence'
		}
		audit.upgraded = true
	}
}
function prepareAuditToSave(audit) {
	if (audit === null) return null
	const data = { ...audit }
	if (data.upgraded) {
		delete data.upgraded
	}
	return data
}

function saveAuditTo(filepath) {
	fs.writeFileSync(filepath, JSON.stringify(prepareAuditToSave(currentAudit), null, 2))
}


function openAudit(filepaths) {
	const allAudits = []
	const errors = []
	let mainAudit = null
	for (const filepath of filepaths) {
		try {
			allAudits.push(loadAudit(fs.readFileSync(filepath)))			
		} catch (err) {
			errors.push(err)
		}
	}
	if (errors.length === filepaths.length) {
		throw new Error(errors.map(e => e.message).join(', '))
	} else {
		for (const a of allAudits) {
			if (!mainAudit) mainAudit = a
			else {
				if (!mainAudit.combined) { 
					mainAudit.originalData = [ mainAudit.originalData, a.originalData ]
					mainAudit.combined = true
				} else {
					mainAudit.originalData.push(a.originalData)
				}
				for (const s of a.sentences) {
					mainAudit.sentences.push(s)
				}
			}
		}
	}
	currentAudit = mainAudit
	appWindow && appWindow.$emit && appWindow.$emit('audit:load', currentAudit)
	saveState()
	if (errors.length === 0) {
		return true
	} else {
		return errors
	}
}


ipcMain.on('main:log', (e, args) => {
	console.log.apply(console, args)
})

function GoogleSearch(text, exact, options) {
	const opts = { ...options }
	return new Promise((resolve, reject) => {
		if (exact && text[0] != '"') {
			text = `"${text}"`
		}
		const lt = (e, results) => {
			resolve(results)
		}
		ipcMain.once('google:results', lt)
		let timeout = setTimeout(() => {
			ipcMain.off('google:results', lt)			
			reject(new Error('Timeout'))
		}, 10000)
		if (googleClient) {
			googleClient.currentSearch = {
				resolve,
				reject,
				timeout,
				window: opts.window || null,
				emit: opts.emit || null,
				text,
			}
			googleClient.emit('search', text)
		} else {
			reject(new Error('No google client.'))
		}
	
	})
}
function id(prefix) {
	const time = Date.now().toString(36)
	const random = Number(Math.random()*1_000_000_000).toString(36)
	if (!prefix) {
		prefix = ''
	}
	return prefix + time + random
}

let prGoogleSearchInit = null

function GoogleSearchInit(options) {
	const opts = { ...options }
	const currentSearch = {
		window: opts.window || null,
		emit: opts.emit || null,	
	}
	if (googleClient) {
		googleClient.currentSearch = currentSearch
	}
	if (googleClient && ~['search', 'ready'].indexOf(googleClient.state)) {
		return Promise.resolve()
	} else if (googleClient && googleClient.state === 'captcha') {
		return Promise.reject(new Error('Captcha required.'))
	} else if (googleClient) {
		return Promise.reject(new Error('Window not ready'))
	}
	if (prGoogleSearchInit) return prGoogleSearchInit.promise
	prGoogleSearchInit = {}
	const pr = new Promise((resolve, reject) => {
		prGoogleSearchInit.resolve = (v) => {
			prGoogleSearchInit = null
			resolve(v)
		}
		prGoogleSearchInit.reject = (v) => {
			prGoogleSearchInit = null
			reject(v)
		}
	})
	prGoogleSearchInit.promise = pr
	googleClient = { currentSearch }
	googleClient.window = createGoogleSearchWindow()
	googleClient.window.on('closed', () => {
		googleClient = null
	})
	return pr
}
function SetEnableMenuItem(id, val) {
	Menu.getApplicationMenu().getMenuItemById(id).enabled = val
}

let appWindow = null
let pckg = JSON.parse(fs.readFileSync(path.join(app.getAppPath(), 'package.json')))

function reloadMenu() {
	applicationGlobalMenu = null
	Menu.setApplicationMenu(applicationMenu())
	appWindow && appWindow.setMenu(applicationMenu())
}

app.whenReady().then(async() => {
	if (IS_DEV) await session.defaultSession.loadExtension(path.join(app.getAppPath(), 'src', 'vue-dev-tools-extension'))
	Menu.setApplicationMenu(applicationMenu())
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		const name = pckg.name
		if (details.requestHeaders['User-Agent']) {
			details.requestHeaders['User-Agent'] = details.requestHeaders['User-Agent'].replace(new RegExp(name + '\\/[0-9a-z.-]+\\s', 'i'), '').replace(/Electron\/[0-9a-z.-]+\s/i, '')
		}
		callback({ cancel: false, requestHeaders: details.requestHeaders })
	})

	session.defaultSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
		let cancel = false
		if (googleClient && googleClient.webContents && details.webContentsId) {
			if (googleClient.webContents.id === details.webContentsId) {
				if (!~['consent-window', 'captcha'].indexOf(googleClient.state) && !~['script, xhr'].indexOf(details.resourceType)) {
					cancel = true
				}
			}
		}
		callback({ cancel })
	})
	ipcMain.on('click', (e, position) => {
		const contents = e.sender
		contents.sendInputEvent({ ...position, type:'mouseMove' })
		contents.sendInputEvent({ ...position, type:'mouseDown', button:'left', clickCount: 1 })
		contents.sendInputEvent({ ...position, type:'mouseUp', button:'left', clickCount: 1 })
	})
	ipcMain.on('google:init', (e) => {
		const window = BrowserWindow.fromWebContents(e.sender)
		if (googleClient && googleClient.interval) {
			clearInterval(googleClient.interval)
		}
		if (googleClient && googleClient.window && window.id !== googleClient.window.id) {
			googleClient.window.close()
			googleClient = null
		}
		googleClient = Object.assign({}, googleClient, {
			webContents: e.sender,
			frame: e.senderFrame,
			window: BrowserWindow.fromWebContents(e.sender),
			emit: e.reply,
			state: googleClient && googleClient.state ? googleClient.state : 'init',
			wasConsented: googleClient ? googleClient.state === 'consent-window' : false,
			wasReadyBefore: googleClient ? googleClient.state === 'ready' || googleClient.state === 'search' : false,
			wasCaptchaBefore: googleClient ? googleClient.state === 'captcha' : false,
			lastStateUpdate: new Date(),
			interval: setInterval(() => {
				if (googleClient && googleClient.state !== 'ready' && (new Date() - googleClient.lastStateUpdate) > 1000 * 30) {
					if (prGoogleSearchInit) {
						prGoogleSearchInit.reject(new Error('An unknown error occurred.'))
					}
				} else if (googleClient.state === 'ready') {
					clearInterval(googleClient.interval)
					googleClient.interval = -1
				}
			}, 5000),
		})
		SetEnableMenuItem('view-google-window', true)
	})
	ipcMain.on('google:search', () => {
		googleClient.state = 'search'
		googleClient.lastStateUpdate = new Date()
		OnGoogleClientReadyOrResults()
		clearInterval(googleClient.interval)
	})
	ipcMain.on('google:consent', () => {
		googleClient.state = 'consent'
		googleClient.lastStateUpdate = new Date()
	})
	ipcMain.on('google:consent-window', () => {
		googleClient.state = 'consent-window'
		googleClient.lastStateUpdate = new Date()
		// googleClient.window.show()
	})
	ipcMain.on('google:ready', () => {
		googleClient.state = 'ready'
		googleClient.lastStateUpdate = new Date()
		OnGoogleClientReady()
		clearInterval(googleClient.interval)
	})
	ipcMain.on('google:captcha', () => {
		googleClient.state = 'captcha'
		googleClient.window.setSize(640, 768)
		if (googleClient.wasReadyBefore) {
			googleClient.window.reload()
		}
		if (prGoogleSearchInit) {
			prGoogleSearchInit.reject(new Error('Captcha required.'))
		} else if (googleClient.currentSearch && googleClient.currentSearch.reject) {
			clearTimeout(googleClient.currentSearch.timeout)
			googleClient.currentSearch.reject(new Error('Captcha required.'))
		}
		if (!bounceIDForCaptcha) {
			bounceIDForCaptcha = AppShowAttention()
		}
	})
	ipcMain.on('google:show-window', () => {
		googleClient && googleClient.window && googleClient.window.show()
	})
	ipcMain.on('google:hide-window', () => {
		googleClient && googleClient.window && googleClient.window.hide()
	})
	ipcMain.handle('boot', async (e) => {
		appWindow.$emit = (...args) => { e.sender.send.apply(e.sender, args) }
		await loadState()
		clearInterval(intervalCheckVersion)
		intervalCheckVersion = setInterval(() => checkNewVersion('interval'), 5 * 60 * 1000)
		checkNewVersion('boot')
		return {
			currentAudit,
			isMac,
			version: app.getVersion(),
		}
	})
	ipcMain.handle('text:parse', async (e, data) => {
		try {
			const results = await worker('text-parse', data)
			currentAudit = {
				originalData: data,
				sentences: results.map(s => ({ 
					id: id('s-'),
					sentence: s.text,
					type: s.type,
					words: s.words, 
					resultsOnGoogle: null, 
					searchLoading: false,
					searchStatus: 'none',
					ignored: s.type !== 'sentence',
				})),
				version: app.getVersion(),
			}
			saveState()
			return currentAudit
		} catch (e) {
			console.error(e)
			throw e
		}
	})
	ipcMain.on('audit:reset', async () => {
		if (!currentAudit) return
		for (const s of currentAudit.sentences) {
			s.resultsOnGoogle = null
			s.searchStatus = 'none'
		}
		saveState()
	})
	ipcMain.handle('sentence:googleSearch', async (e, sentence) => {
		const w = {
			window: BrowserWindow.fromWebContents(e.sender),
			emit: (...args) => e.sender.send.apply(e.sender, args),
		}
		await GoogleSearchInit(w)
		const results = await GoogleSearch(sentence.sentence, true, w)
		if (currentAudit && Array.isArray(currentAudit.sentences)) {
			const s = currentAudit.sentences.find(s => s.id === sentence.id)
			if (s) {
				s.resultsOnGoogle = results.total
				s.searchStatus = 'success'
				saveState()
			}
		}
		return {
			id: sentence.id,
			resultsOnGoogle: results.total,
		}
	})
	ipcMain.handle('sentence:ignored', async(e, id, val) => {
		if (currentAudit && Array.isArray(currentAudit.sentences)) {
			const s = currentAudit.sentences.find(s => s.id === id)
			if (s) {
				s.ignored = !!val
				saveState()
			}
		}
	})
	ipcMain.handle('audit:new', () => {
		currentAudit = null
		saveState()
	})
	ipcMain.handle('debugCode', (e, code) => {
		if (code === '4242') {
			debugMode = !debugMode
			reloadMenu()
		}
	})
	appWindow = createWindow()
	app.on('activate', () => {
		if (!appWindow) {
			appWindow = createWindow()
		}
	})
})