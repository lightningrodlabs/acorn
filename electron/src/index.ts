import { EventEmitter } from 'events'
import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { devOptions, prodOptions, runHolochain, StateSignal } from './holochain'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}

const BACKGROUND_COLOR = '#fbf9f7'

const createMainWindow = (): BrowserWindow => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 1080,
    width: 1920,
    show: false,
    backgroundColor: BACKGROUND_COLOR,
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../../web/dist/index.html'))
  // once its ready to show, show
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  return mainWindow
}

const createSplashWindow = (): BrowserWindow => {
  // Create the browser window.
  const splashWindow = new BrowserWindow({
    height: 450,
    width: 800,
    center: true,
    resizable: false,
    frame: false,
    show: false,
    backgroundColor: BACKGROUND_COLOR,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  })

  // and load the splashscreen.html of the app.
  splashWindow.loadFile(
    path.join(__dirname, '../../web/dist/splashscreen.html')
  )
  // once its ready to show, show
  splashWindow.once('ready-to-show', () => {
    splashWindow.show()
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  return splashWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  const splashWindow = createSplashWindow()
  const events = new EventEmitter()
  events.on('status', (details: StateSignal) => {
    splashWindow.webContents.send('status', details)
  })
  try {
    await runHolochain(events, devOptions)
    splashWindow.close()
    createMainWindow()
  } catch (e) {
    alert('there was an error while starting holochain')
    console.log(e)
    app.quit()
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})
