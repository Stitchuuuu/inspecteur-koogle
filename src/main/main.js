import { app, BrowserWindow, ipcMain, session } from 'electron'
import { platform } from 'os'
import { parseSentences } from './sentence.helper'

import path from 'path'

const pt = platform()
const isMac = pt === 'darwin'
// const isWindows = pt === 'win32'
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
function createGoogleSearchWindow() {
	const win = new BrowserWindow({
		width: 640,
		height: 480,
		show: false,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			preload: IS_DEV ?
				path.join(app.getAppPath(), 'src', 'renderer', 'public', 'preload-google.js') : 
				path.join(app.getAppPath(), 'renderer', 'preload-google.js')
		},
		icon: path.join(app.getAppPath(), isMac ? 'assets/RoundedAppIcon.icns' : 'assets/icon.png')
	})
	if (IS_DEV) {
		win.openDevTools({ mode: 'detach' })
	}
	const uri = new URL('https://www.google.fr/search')
	uri.search = new URLSearchParams({
		// Exact search only
		tbs: 'li:1'
	})
	win.loadURL(uri.toString())
}
let googleClient = null

async function OnGoogleClientReady() {
	const text = `1. Evolution du rapport entre le salarié et le travail
	Les conditions de travail se sont améliorées en 50 ans. Jusqu'au début des années 1900, les théories de l'organisation du travail s'inscrivent dans le courant de l'école classique. Il y a une division horizontale du travail importante car celui-ci est décomposé, les tâches sont segmentées, morcelées. C'est la période du taylorisme qui se définit par le travail à la chaîne, par pièces où c'est la force physique, l'activité manuelle qui dominent. On parlera de pénibilité du travail. Concernant la division verticale du travail, les rapports hiérarchiques s'établissent entre chef et ouvriers. La distribution du travail se fait par une transmission d'ordres et la définition stricte des tâches permet au premier de pouvoir mieux contrôler les seconds. L'homme est "un muscle" obéissant. Les progrès technologiques et les changements culturels ont toujours influencé l’évolution des salariés dans le monde, mais désormais une transformation encore plus rapide est en cours. L’adoption rapide des solutions de haute technologie apportant de nouvelles idées entraînent dans le monde entier d’importants changements dans le mode de vie et les méthodes de travail. Pour les dirigeants d’entreprise qui sont chargés de diriger des environnements de travail modernes, beaucoup de grandes questions restent prioritaires : Comment ces tendances font-elles évoluer les attentes des collaborateurs ? Comment les organisations peuvent-elles faire face aux mutations de l’environnement professionnel tout en restant à l’avant-garde de ces changements ? Aujourd’hui, nos environnements de travail modernes n’ont plus rien à voir avec l’époque où le travail se déroulait à horaires fixes, toujours au même endroit. Les collaborateurs ont plus de contrôle et d’autonomie sur leur manière de travailler, décidant en grande partie comment, quand et où ils travaillent. Les plans de carrière sont moins linéaires. Les individus cherchent un sens à leur travail, ainsi qu'une sécurité financière.
	1.1. “Travailler”
	“Travailler”, mot datant du XIème siècle, venant du latin populaire tripalariare, “torturer avec le tripalium”, un instrument de torture, un dispositif servant à`
	const sentences = parseSentences(text)
	console.log(sentences)
	for (const s of sentences) {
		try {
			const res = await GoogleSearch(s, true)
			if (!res.total) {
				console.log(new Date(), `\x1b[32m[✓] ${s}\x1b[0m`)
			} else {
				console.log(new Date(), `\x1b[31m[x] {${res.total}} ${s}\x1b[0m`)	
			}	
		} catch (err) {
			if (err.message.toLowerCase() === 'timeout') {
				googleClient.window.show()
			}
			console.error(err.message)
			break
		}

	}
}
ipcMain.on('main:log', (e, args) => {
	console.log.apply(console, args)
})

function GoogleSearch(text, exact) {
	return new Promise((resolve, reject) => {
		if (exact && text[0] != '"') {
			text = `"${text}"`
		}
		const lt = (e, results) => {
			resolve(results)
		}
		ipcMain.once('google:results', lt)
		setTimeout(() => {
			ipcMain.off('google:results', lt)			
			reject(new Error('Timeout'))
		}, 10000)
		if (googleClient) {
			googleClient.emit('search', text)
		} else {
			reject(new Error('No google client.'))
		}
	
	})
}

app.whenReady().then(() => {
	session.defaultSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
		let cancel = false
		if (googleClient && details.webContentsId) {
			if (googleClient.webContents.id === details.webContentsId) {
				if (googleClient.state !== 'captcha' && !~['script, xhr'].indexOf(details.resourceType)) {
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
		if (googleClient) {
			clearInterval(googleClient.interval)
		}
		if (googleClient && window.id !== googleClient.window.id) {
			googleClient.window.close()
			googleClient = null
		}
		googleClient = {
			webContents: e.sender,
			frame: e.senderFrame,
			window: BrowserWindow.fromWebContents(e.sender),
			emit: e.reply,
			state: 'init',
			lastStateUpdate: new Date(),
			interval: setInterval(() => {
				if (googleClient && googleClient.state !== 'ready' && (new Date() - googleClient.lastStateUpdate) > 1000 * 30) {
					if (!googleClient.window.isVisible()) {
						googleClient.window.show()
					}
				} else if (googleClient.state === 'ready') {
					clearInterval(googleClient.interval)
					googleClient.interval = -1
					if (!googleClient.window.isVisible()) {
						googleClient.window.show()
					}
				}
			}, 5000)
		}
	})
	ipcMain.on('google:search', () => {
		googleClient.state = 'search'
		googleClient.lastStateUpdate = new Date()
		clearInterval(googleClient.interval)
	})
	ipcMain.on('google:consent', () => {
		googleClient.state = 'consent'
		googleClient.lastStateUpdate = new Date()
	})
	ipcMain.on('google:consent-window', () => {
		googleClient.state = 'consent-window'
		googleClient.lastStateUpdate = new Date()
		googleClient.window.show()
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
		googleClient.window.show()
	})
	createGoogleSearchWindow()
})