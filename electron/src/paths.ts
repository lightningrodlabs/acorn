import { app } from 'electron'
import * as path from 'path'

// see the DEVELOPERS.md about incrementing
// these values
export const INTEGRITY_VERSION_NUMBER = 8
export const KEYSTORE_VERSION_NUMBER = 4

const userNumber = process.env.ACORN_TEST_USER_2 ? '2' : ''
const MIGRATION_FILE_NAME_PREFIX = `data-migration-for-integrity-version-`
const USER_DATA_PATH = app.isPackaged
  ? app.getPath('userData')
  : path.join(__dirname, `../../user${userNumber}-data/`)
const USER_DATA_MIGRATION_FILE_PATH = path.join(
  USER_DATA_PATH,
  `${MIGRATION_FILE_NAME_PREFIX}${INTEGRITY_VERSION_NUMBER}`
)
const prevIntegrityVersion = 6 // <-- SPECIAL CASE -- INTEGRITY_VERSION_NUMBER - 1
const PREV_VER_USER_DATA_MIGRATION_FILE_PATH = path.join(
  USER_DATA_PATH,
  `${MIGRATION_FILE_NAME_PREFIX}${prevIntegrityVersion}`
)
export {
  USER_DATA_PATH,
  USER_DATA_MIGRATION_FILE_PATH,
  PREV_VER_USER_DATA_MIGRATION_FILE_PATH,
}
