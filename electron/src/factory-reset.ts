import { app } from 'electron'
import { deleteFolderRecursive } from './file-utils'
import { KEYSTORE_PATH, DATASTORE_PATH } from './paths'
import * as fs from 'fs'

export default function factoryResetVersion() {
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
