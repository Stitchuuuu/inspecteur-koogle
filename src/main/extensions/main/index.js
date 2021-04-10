
import electron from 'electron'
import { Extension } from '@/extension'
import { Twitch } from '../twitch'
import { Overlay } from '../overlay'

import { inspect } from 'util'
import { platform } from 'os'

import fs from 'fs'
import path from 'path'

const pt = platform()
const isMac = pt === 'darwin'
const isWindows = pt === 'win32'

const { app, session, BrowserWindow, Menu, Tray, screen } = electron

const IS_DEV = !((app && app.isPackaged) || process.env.NODE_ENV === 'production')

function show(win, page) {
	if (!page) page = ''
	if (app.isPackaged || process.env.NODE_ENV === 'production') {
		if (page) page = '#' + page
    win.loadURL('file://' + app.getAppPath() + '/renderer/index.html' + page)
  } else {
    win.loadURL('http://localhost:8080/' + page)
  }
}

function createOverlayWindow(relativeURL) {
	if (app.dock && app.dock.hide) app.dock.hide()
	const { width, height } = screen.getPrimaryDisplay().size
  const win = new BrowserWindow({
    width: 500,
    height: 500,
    frame: false,
		transparent: true,
    alwaysOnTop: true,
    minimizable: false,
    maximizable: false,
		closable: true,
		focusable: true,
    titleBarStyle: 'customButtonsOnHover',
    visibleOnAllWorkspaces: true,
    hasShadow: false,
    webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			preload: IS_DEV ?
				path.join(app.getAppPath(), 'src', 'renderer', 'public', 'preload.js') : 
				path.join(app.getAppPath(), 'renderer', 'preload.js')
    },
		icon: path.join(app.getAppPath(), isMac ? 'assets/RoundedAppIcon.icns' : 'assets/icon.png')
  })
  win.setPosition(0, 0, false)
	win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
	// win.setIgnoreMouseEvents(true)
	win.setAlwaysOnTop(true, 'screen-saver')
	/*
	win.openDevTools({ 
		detached: true
	})
	*/
	app.dock.show()
	show(win, relativeURL)
	if (IS_DEV) {
		// win.openDevTools({ mode: 'detach' })
	}
}
function createWindow(relativeURL, options) {
	const opts = {
		width: 800,
		height: 640,
		...options
	}
  // Create the browser window.
  const win = new BrowserWindow({
    width: opts.width,
    height: opts.height,
		show: true,
    webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			preload: IS_DEV ?
				path.join(app.getAppPath(), 'src', 'renderer', 'public', 'preload.js') : 
				path.join(app.getAppPath(), 'renderer', 'preload.js')
    },
		icon: path.join(app.getAppPath(), isMac ? 'assets/RoundedAppIcon.icns' : 'assets/icon.png')
  })
  show(win, relativeURL)
	if (IS_DEV) {
		win.openDevTools({ mode: 'detach' })
	}
}
let tray

const USER_SETTINGS_PATH = app ? app.getPath('userData') : './'
const EXTENSIONS_PATH = path.join(USER_SETTINGS_PATH, 'extensions')
const OVERLAY_PATH = path.join(USER_SETTINGS_PATH, 'overlay', 'default')

function InitUserSettings() {
	if (!fs.existsSync(EXTENSIONS_PATH)) {
		fs.mkdirSync(EXTENSIONS_PATH, { recursive: true })
	}
	if (!fs.existsSync(OVERLAY_PATH)) {
		fs.mkdirSync(OVERLAY_PATH, { recursive: true })
	}
}

function GetUserExtensions() {
	const extensions = []
	const files = fs.readdirSync(EXTENSIONS_PATH)
	for (const f of files) {
		if (!f.startsWith('.') && f.endsWith('.json')) {
			try {
				extensions.push(JSON.parse(fs.readFileSync(path.join(EXTENSIONS_PATH, f))))
			} catch (e) {
				console.error('Could not parse extension file', path.join(EXTENSIONS_PATH, f))
			}
		}
	}
	return extensions
}
function GetOverlays() {
	return ['default']
}
/*
function GetOverlaySources() {
	const extensions = []
	const sourceListFile = path.join(OVERLAY_PATH, 'sources.json')
	let sources = null
	if (fs.existsSync(sourceListFile)) {
		try {
			sources = JSON.parse(fs.readFileSync(sourceListFile))
		} catch(e) {
			sources = null
		}
	}
	if (sources === null) {
		sources = DEFAULT_OVERLAY_SOURCES
	}
	for (let i = 0; i < sources.length; i++) {
		sources[i] = SharedObject.fromJSON(sources[i])
	}
	return sources
}
*/

function ClearUserSettings() {
	fs.rmdirSync(EXTENSIONS_PATH, { recursive: true })
	fs.rmdirSync(OVERLAY_PATH, { recursive: true })
	InitUserSettings()
}
const DEFAULT_OVERLAY = {extension: 'overlay', config: { name: 'default', default: true }}
const DEFAULT_EXTENSIONS = [
	{extension: 'twitch'},
	DEFAULT_OVERLAY,
]

const EXTENSIONS = [Twitch, Overlay]

function generateInstanceExtension(extConfigFromFile) {
	const ext = extConfigFromFile
	const cl = EXTENSIONS.find(cl => ext.extension === cl.extension.name)
	if (!cl) return null
	const obj = { ...ext }
	delete obj.extension
	ext.$instance = new cl(obj)
	ext.$instance.on('save', (o) => {
		console.log(`Main | Must save extension ${o.extension}#${o.id} / from ${o.type}`)
		const p = path.join(EXTENSIONS_PATH, ext.$instance.id + '.json')
		fs.writeFileSync(p, JSON.stringify(o))
		console.log(`Main | Saved extension ${o.extension}#${o.id} config in ${p}`, JSON.stringify(o))
	})
	return ext
}

export class Main extends Extension {
	/**
	 * @type {Extension[]}
	 */
	#extensions = []

	static get extension() {
		return { name: 'main' }
	}

	constructor(...args) {
		super(...arguments)
		this.tray = null
		InitUserSettings()
		let extensions = GetUserExtensions()
		if (!extensions.length) {
			extensions = DEFAULT_EXTENSIONS
		}

		for (const ext of extensions) {
			const ext2 = generateInstanceExtension(ext)
			if (!ext2) continue
			this.#extensions.push(ext2)
		}
		let overlay = this.#extensions.find(ext => ext.extension === 'overlay')
		if (!overlay) {
			overlay = generateInstanceExtension(DEFAULT_OVERLAY)
			this.#extensions.push(overlay)
		}
		this.$ipc.on('log', (e, ...args) => {
			console.log.apply(console, [new Date(), 'Renderer |',...args])
		})
		this.$ipc.handle('main:extensions', () => {
			return this.extensionsForRenderer()
		})
		app.whenReady().then(async() => {
			if (IS_DEV) await session.defaultSession.loadExtension('/Users/stitchuuuu/Library/Application Support/BraveSoftware/Brave-Browser/Profile 1/Extensions/ljjemllljcmogpfapbkkighbhhppjdbg/6.0.0.7_0')			
			const main = createWindow('/')
			setInterval(() => {
				// this.$ipc.emit('screenpoint', screen.getCursorScreenPoint())
			}, 150)
			this.initTray()
		})

		this.$ipc.handle('main:open-window', (options) => {
			const opts = { ...options, type: 'normal' }
			const winOptions = { ...opts }
			const url = opts.url
			delete winOptions.type
			delete winOptions.url
			switch (opts.type) {
				default:
					createWindow(url, winOptions)
					break
			}
		})

		this.afterInitExtensions()
	}
	async afterInitExtensions() {
		for (const ext of this.#extensions) {
			if (ext.$instance) {
				ext.$instance.on('update', () => {
					// this.$ipc.emit('extensions:update', this.extensionsForRenderer())
				})
			}
		}
	}
	initTray() {
		this.tray = new Tray(app.getAppPath() + (isMac ? '/assets/TrayTemplate.png' : '/assets/tray.png'))
		const contextMenu = Menu.buildFromTemplate([
			{ label: 'Project Sirius', enabled: false },
			{ type: 'separator' },
			{ label: 'Quit Project Sirius', click: () => {
				app.exit()
			} },
		])
		this.tray.setToolTip('Project Sirius')
		this.tray.setContextMenu(contextMenu)
	}
	extensionsForRenderer() {
		return this.#extensions.map(ext => ({
			id: ext.id,
			config: ext.$instance.$config,
			name: ext.$instance.constructor.extension.name,
			data: ext.$instance.$data,
		}))
	}

	static init() {
		new Main()
	}
}
