import { app, BrowserWindow, ipcMain, shell } from 'electron'
import * as path from 'path'
// import log from 'electron-log'
import initAgent, {
  StateSignal,
  STATUS_EVENT,
} from '@sprillow-connor/electron-holochain'

import {
  devOptions,
  projectsDnaPath,
  prodOptions,
  stateSignalToText,
  BINARY_PATHS,
} from './holochain'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
// eslint-disable-line global-require
// app.quit()
// }
process.on('uncaughtException', (e) => {
  console.error('an unhandled error occurred:', e)
})

const BACKGROUND_COLOR = '#f7f5f3'



const MAIN_FILE = path.join(__dirname, '../web/index.html')
const SPLASH_FILE = path.join(__dirname, '../web/splashscreen.html')
const LINUX_ICON_FILE = path.join(
  __dirname,
  '../web/logo/acorn-app-icon-aug2022-512px.png'
)

const DEVELOPMENT_UI_URL = process.env.ACORN_TEST_USER_2
  ? 'http://localhost:8081'
  : 'http://localhost:8080'

const createMainWindow = (): BrowserWindow => {
  // Create the browser window.
  const options: Electron.BrowserWindowConstructorOptions = {
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
  }
  if (process.platform === 'linux') {
    options.icon = LINUX_ICON_FILE
  }
  const mainWindow = new BrowserWindow(options)
  // and load the index.html of the app.
  if (app.isPackaged) {
    mainWindow.loadFile(MAIN_FILE)
  } else {
    // development
    mainWindow.loadURL(DEVELOPMENT_UI_URL)
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
  if (app.isPackaged) {
    splashWindow.loadFile(SPLASH_FILE)
  } else {
    // development
    splashWindow.loadURL(`${DEVELOPMENT_UI_URL}/splashscreen.html`)
  }
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
  const opts = app.isPackaged ? prodOptions : devOptions
  const { statusEmitter, shutdown } = await initAgent(app, opts, BINARY_PATHS)
  statusEmitter.on(STATUS_EVENT, (state: StateSignal) => {
    switch (state) {
      case StateSignal.IsReady:
        // important that this line comes before the next one
        // otherwise this triggers the 'all-windows-closed'
        // event
        createMainWindow()
        splashWindow.close()
        break
      default:
        splashWindow.webContents.send('status', stateSignalToText(state))
    }
  })
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
  return projectsDnaPath
})
