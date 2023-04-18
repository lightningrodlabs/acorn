import { app, BrowserWindow, ipcMain, shell, autoUpdater } from 'electron'
import * as contextMenu from 'electron-context-menu'
import * as path from 'path'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
// import log from 'electron-log'
import initAgent, {
  StateSignal,
  STATUS_EVENT,
} from '@lightningrodlabs/electron-holochain'

import {
  devOptions,
  projectsHappPath,
  prodOptions,
  stateSignalToText,
  BINARY_PATHS,
} from './holochain'
import {
  INTEGRITY_VERSION_NUMBER,
  PREV_VER_USER_DATA_MIGRATION_FILE_PATH,
  USER_DATA_MIGRATION_FILE_PATH,
} from './paths'

dotenv.config({ path: '../.env' })
console.log(process.env)

// add the right-click "context" menu
contextMenu({
  showSaveImageAs: true,
})

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
// eslint-disable-line global-require
// app.quit()
// }
process.on('uncaughtException', (e) => {
  console.error('an unhandled error occurred:', e)
})

const BACKGROUND_COLOR = '#f7f5f3'

const MAIN_FILE = path.join(
  app.getAppPath(),
  '../app.asar.unpacked/web/index.html'
)
const SPLASH_FILE = path.join(
  app.getAppPath(),
  '../app.asar.unpacked/web/splashscreen.html'
)
const LINUX_ICON_FILE = path.join(
  app.getAppPath(),
  '../app.asar.unpacked/web/logo/acorn-app-icon-512px.png'
)

const DEVELOPMENT_UI_URL = `http://localhost:${
  process.env.ACORN_TEST_USER_2
    ? process.env.PORT_UI_USER_2
    : process.env.PORT_UI_USER_1
}`

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

  // let the browser window know when the individual project export
  // download has completed
  mainWindow.webContents.session.on(
    'will-download',
    (event, item, webContents) => {
      // Set the save path, making Electron not to prompt a save dialog.
      // item.setSavePath('/tmp/save.pdf')
      item.once('done', (event, state) => {
        if (state === 'completed') {
          mainWindow.webContents.send('exportDownloaded')
        }
      })
    }
  )

  // once its ready to show, show
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  autoUpdater.once('update-downloaded', () => {
    mainWindow.webContents.send('updateDownloaded')
    // give the client UI a couple seconds to alert the user
    setTimeout(() => {
      autoUpdater.quitAndInstall()
    }, 4000)
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
  return projectsHappPath
})

ipcMain.handle('getVersion', () => {
  return {
    // append v to match the tag name
    version: `v${app.getVersion()}`,
    platform: process.platform,
    arch: process.arch,
  }
})

ipcMain.on('initiateUpdate', () => {
  console.log('received initiateUpdate')
  if (app.isPackaged) {
    const server = 'https://update.electronjs.org'
    const feed = `${server}/lightningrodlabs/acorn/${process.platform}-${
      process.arch
    }/v${app.getVersion()}`
    console.log(`autoUpdater.setFeedURL({ url: ${feed} })`)
    autoUpdater.setFeedURL({ url: feed })
    // at this point we are not so much 'checking for updates'
    // as we are pretty sure (via the front-end) that there is an update
    // for us to download, and we've been instructed to.
    autoUpdater.checkForUpdates()
    // once the update is downloaded, it will trigger the 'update-downloaded' event, which will be
    // separately listened for, and an event emitted to the client
  }
})

ipcMain.handle('persistExportData', (event, data) => {
  console.log('received persistExportData')
  console.log('migrationFile', USER_DATA_MIGRATION_FILE_PATH)
  try {
    const dataObj = JSON.parse(data)
    const modifiedData = {
      integrityVersion: INTEGRITY_VERSION_NUMBER,
      ...dataObj,
    }
    fs.writeFileSync(
      USER_DATA_MIGRATION_FILE_PATH,
      JSON.stringify(modifiedData, null, 2),
      {
        encoding: 'utf-8',
      }
    )
  } catch (e) {}
})

ipcMain.handle('checkForMigrationData', (event) => {
  console.log('received checkForMigrationData')
  // INTEGRITY_VERSION_NUMBER will just be incremented one number at a time
  if (fs.existsSync(PREV_VER_USER_DATA_MIGRATION_FILE_PATH)) {
    const prevVersionMigrationDataString = fs.readFileSync(
      PREV_VER_USER_DATA_MIGRATION_FILE_PATH,
      { encoding: 'utf-8' }
    )
    return prevVersionMigrationDataString
  } else {
    return ''
  }
})

ipcMain.on('markMigrationDone', () => {
  console.log('received markMigrationDone')
  // INTEGRITY_VERSION_NUMBER will just be incremented one number at a time
  // delete the file, thus completing the migration
  fs.unlinkSync(PREV_VER_USER_DATA_MIGRATION_FILE_PATH)
})
