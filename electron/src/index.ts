import { EventEmitter } from 'events'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import * as path from 'path'
import log from 'electron-log'
import { devOptions, prodOptions, runHolochain, StateSignal } from './holochain'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
// eslint-disable-line global-require
// app.quit()
// }

const BACKGROUND_COLOR = '#fbf9f7'
// must point to unpacked versions, not in an asar archive
// in production
const HOLOCHAIN_BINARY_PATH = app.isPackaged
  ? path.join(__dirname, '../../app.asar.unpacked/binaries/acorn-conductor')
  : path.join(__dirname, '../binaries/acorn-conductor')
const LAIR_KEYSTORE_PATH = app.isPackaged
  ? path.join(__dirname, '../../app.asar.unpacked/binaries/lair-keystore')
  : path.join(__dirname, '../binaries/lair-keystore')
const MAIN_FILE = path.join(__dirname, '../web/index.html')
const SPLASH_FILE = path.join(__dirname, '../web/splashscreen.html')

const createMainWindow = (): BrowserWindow => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 1080,
    width: 1920,
    show: false,
    backgroundColor: BACKGROUND_COLOR,
    // use these settings so that the ui
    // can check paths
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  })
  // and load the index.html of the app.
  if (app.isPackaged) {
    mainWindow.loadFile(MAIN_FILE)
  } else {
    // development
    mainWindow.loadURL('http://localhost:8081')
  }
  // Open <a href='' target='_blank'> with default system browser
  mainWindow.webContents.on('new-window', function (event, url) {
    event.preventDefault()
    shell.openExternal(url)
  })
  // once its ready to show, show
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
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
    // use these settings so that the ui
    // can listen for status change events
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  })

  // and load the splashscreen.html of the app.
  splashWindow.loadFile(SPLASH_FILE)
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
  const opts = app.isPackaged ? prodOptions : devOptions
  try {
    const [lairHandle, holochainHandle] = await runHolochain(
      events,
      opts,
      HOLOCHAIN_BINARY_PATH,
      LAIR_KEYSTORE_PATH
    )
    app.on('will-quit', () => {
      // sigterm is the default, and that's good
      lairHandle.kill()
      holochainHandle.kill()
    })
    splashWindow.close()
    createMainWindow()
  } catch (e) {
    log.error(e)
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

ipcMain.handle('getProjectsPath', () => {
  return app.isPackaged
    ? path.join(app.getAppPath(), '../app.asar.unpacked/binaries/projects.dna')
    : path.join(app.getAppPath(), '../dna/workdir/projects.dna')
})