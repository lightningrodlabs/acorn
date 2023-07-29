import { app, dialog } from 'electron'
import { deleteFolderRecursive } from './file-utils'
import { KEYSTORE_PATH, DATASTORE_PATH } from './paths'
import * as fs from 'fs'

const factoryResetVersion = () => {
  if (fs.existsSync(KEYSTORE_PATH)) {
    try {
      deleteFolderRecursive(KEYSTORE_PATH)
    } catch (err) {
      console.error(`Error deleting ${KEYSTORE_PATH}: ${err.message}`)
    }
  }
  if (fs.existsSync(DATASTORE_PATH)) {
    try {
      deleteFolderRecursive(DATASTORE_PATH)
    } catch (err) {
      console.error(`Error deleting ${DATASTORE_PATH}: ${err.message}`)
    }
  }

  // restart the app
  app.relaunch()
  app.quit()
}

const factoryResetWithWarning = () => {
  // show a message box and factory reset if they confirm
  dialog
    .showMessageBox({
      message: 'Would you like to perform a factory reset of this Acorn version? This will delete all data associated with this version of Acorn permanently. It will not interfere with the data associated with other versions of Acorn.',
      type: 'warning',
      buttons: ['Confirm', 'Cancel'],
    })
    .then(({ response }) => {
      if (response === 0) {
        factoryResetVersion()
      }
    })
}

export default factoryResetWithWarning
