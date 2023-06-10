import { app } from 'electron'
import * as path from 'path'

// see the DEVELOPERS.md about incrementing
// these values
export const INTEGRITY_VERSION_NUMBER = 9
export const KEYSTORE_VERSION_NUMBER = 5

const DEV_USER_NUMBER = process.env.ACORN_AGENT_NUM

const MIGRATION_FILE_NAME_PREFIX = `data-migration-for-integrity-version-`

const USER_DATA_PATH = app.isPackaged
  ? app.getPath('userData')
  : path.join(__dirname, `../../user-data/agent${DEV_USER_NUMBER}`)

const USER_DATA_MIGRATION_FILE_PATH = path.join(
  USER_DATA_PATH,
  `${MIGRATION_FILE_NAME_PREFIX}${INTEGRITY_VERSION_NUMBER}`
)
const PREV_VER_USER_DATA_MIGRATION_FILE_PATHS = [
  // Acorn 3
  path.join(USER_DATA_PATH, `${MIGRATION_FILE_NAME_PREFIX}5`),
  // Acorn 4
  path.join(USER_DATA_PATH, `${MIGRATION_FILE_NAME_PREFIX}6`),
  // Acorn 5
  path.join(USER_DATA_PATH, `${MIGRATION_FILE_NAME_PREFIX}8`),
]
export {
  USER_DATA_PATH,
  USER_DATA_MIGRATION_FILE_PATH,
  PREV_VER_USER_DATA_MIGRATION_FILE_PATHS,
}
