import { app } from 'electron'
import * as path from 'path'

// see the DEVELOPERS.md about incrementing
// these values
export const INTEGRITY_VERSION_NUMBER = 9
export const KEYSTORE_VERSION_NUMBER = 5

const DEV_USER_NUMBER = process.env.ACORN_AGENT_NUM

const MIGRATION_FILE_NAME_PREFIX = `data-migration-for-integrity-version-`

const DEV_USER_DATA_PATH = app.isPackaged
  ? app.getPath('userData')
  : path.join(__dirname, `../../user-data/agent${DEV_USER_NUMBER}`)

const USER_DATA_MIGRATION_FILE_PATH = path.join(
  DEV_USER_DATA_PATH,
  `${MIGRATION_FILE_NAME_PREFIX}${INTEGRITY_VERSION_NUMBER}`
)
const PREV_VER_USER_DATA_MIGRATION_FILE_PATHS = [
  // Acorn 3
  path.join(DEV_USER_DATA_PATH, `${MIGRATION_FILE_NAME_PREFIX}5`),
  // Acorn 4
  path.join(DEV_USER_DATA_PATH, `${MIGRATION_FILE_NAME_PREFIX}6`),
  // Acorn 5
  path.join(DEV_USER_DATA_PATH, `${MIGRATION_FILE_NAME_PREFIX}8`),
]

const PROJECTS_HAPP_PATH = app.isPackaged
  ? path.join(app.getAppPath(), '../app.asar.unpacked/binaries/projects.happ')
  : path.join(app.getAppPath(), 'binaries/projects.happ')

const PROFILES_HAPP_PATH = app.isPackaged
  ? path.join(app.getAppPath(), '../app.asar.unpacked/binaries/profiles.happ')
  : path.join(app.getAppPath(), 'binaries/profiles.happ')

const DATASTORE_PATH = app.isPackaged
  ? path.join(
      app.getPath('userData'),
      `junk-databases-${INTEGRITY_VERSION_NUMBER}`
    )
  : path.join(DEV_USER_DATA_PATH, `databases-${INTEGRITY_VERSION_NUMBER}`)

const KEYSTORE_PATH = app.isPackaged
  ? path.join(
      app.getPath('userData'),
      `junk-keystore-${KEYSTORE_VERSION_NUMBER}`
    )
  : path.join(DEV_USER_DATA_PATH, `keystore-${KEYSTORE_VERSION_NUMBER}`)

export {
  DEV_USER_DATA_PATH as USER_DATA_PATH,
  USER_DATA_MIGRATION_FILE_PATH,
  PREV_VER_USER_DATA_MIGRATION_FILE_PATHS,
  PROJECTS_HAPP_PATH,
  PROFILES_HAPP_PATH,
  DATASTORE_PATH,
  KEYSTORE_PATH,
}
