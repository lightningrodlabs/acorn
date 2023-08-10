import { PathOptions } from '@lightningrodlabs/electron-holochain/dist/src/options'
import { app } from 'electron'
import * as path from 'path'

// see the DEVELOPERS.md about incrementing
// these values
export const INTEGRITY_VERSION_NUMBER = 10
export const KEYSTORE_VERSION_NUMBER = 6

const DEV_USER_NUMBER = process.env.ACORN_AGENT_NUM

const MIGRATION_FILE_NAME_PREFIX = `data-migration-for-integrity-version-`

const USER_DATA_PATH = app.isPackaged
  ? app.getPath('userData')
  : path.join(__dirname, `../../user-data/agent${DEV_USER_NUMBER}`)

const USER_DATA_MIGRATION_FILE_PATH = path.join(
  USER_DATA_PATH,
  `${MIGRATION_FILE_NAME_PREFIX}${INTEGRITY_VERSION_NUMBER}`
)
// this array defines which previous versions of acorn it 
// is possible to migrate from
const PREV_VER_USER_DATA_MIGRATION_FILE_PATHS = [
  // Acorn 3
  path.join(USER_DATA_PATH, `${MIGRATION_FILE_NAME_PREFIX}5`),
  // Acorn 4
  path.join(USER_DATA_PATH, `${MIGRATION_FILE_NAME_PREFIX}6`),
  // Acorn 5
  path.join(USER_DATA_PATH, `${MIGRATION_FILE_NAME_PREFIX}8`),
  // Acorn 6
  path.join(USER_DATA_PATH, `${MIGRATION_FILE_NAME_PREFIX}9`),
  // uncomment the below line for development testing
  // of migration-feature
  // path.join(USER_DATA_PATH, `${MIGRATION_FILE_NAME_PREFIX}${INTEGRITY_VERSION_NUMBER}`),
]

const PROJECTS_HAPP_PATH = app.isPackaged
  ? path.join(app.getAppPath(), '../app.asar.unpacked/binaries/projects.happ')
  : path.join(app.getAppPath(), 'binaries/projects.happ')

const PROFILES_HAPP_PATH = app.isPackaged
  ? path.join(app.getAppPath(), '../app.asar.unpacked/binaries/profiles.happ')
  : path.join(app.getAppPath(), 'binaries/profiles.happ')

const DATASTORE_PATH = path.join(
  USER_DATA_PATH,
  `databases-${INTEGRITY_VERSION_NUMBER}`
)

const KEYSTORE_PATH = path.join(
  USER_DATA_PATH,
  `keystore-${KEYSTORE_VERSION_NUMBER}`
)

// in production
// must point to unpacked versions, not in an asar archive
// in development
// fall back on defaults in the electron-holochain package
const BINARY_PATHS: PathOptions | undefined = app.isPackaged
  ? {
      holochainRunnerBinaryPath: path.join(
        __dirname,
        `../../app.asar.unpacked/binaries/holochain-runner${
          process.platform === 'win32' ? '.exe' : ''
        }`
      ),
    }
  : undefined

export {
  USER_DATA_PATH,
  USER_DATA_MIGRATION_FILE_PATH,
  PREV_VER_USER_DATA_MIGRATION_FILE_PATHS,
  PROJECTS_HAPP_PATH,
  PROFILES_HAPP_PATH,
  DATASTORE_PATH,
  KEYSTORE_PATH,
  BINARY_PATHS,
}
