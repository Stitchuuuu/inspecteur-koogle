const { app, BrowserWindow } = require('electron')

function createSimpleWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
    },
  })

}
function createOverlayWindow() {
  app.dock.hide()
  // Create the browser window.
  const win = new BrowserWindow({
    width: 500,
    height: 500,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    minimizable: false,
    maximizable: false,
    closable: false,
    titleBarStyle: 'customButtonsOnHover',
    visibleOnAllWorkspaces: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
    },
  })
  win.setPosition(0, 0, false)
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  console.log(win.isVisibleOnAllWorkspaces())
  // and load the index.html of the app.
  win.setAlwaysOnTop(true, 'screen-saver')
  win.loadFile('index.html')
  win.setIgnoreMouseEvents(true)
  setTimeout(() => {
      win.close()
  }, 10000)
}

app.whenReady().then(createWindow)

try {
    require('electron-reloader')(module)
} catch (_) {}