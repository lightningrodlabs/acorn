import {
  ElectronHolochainOptions,
  StateSignal,
} from '@lightningrodlabs/electron-holochain'
import { DATASTORE_PATH, KEYSTORE_PATH, ACORN_HAPP_PATH } from './paths'

// these messages get seen on the splash page
export enum StateSignalText {
  IsFirstRun = 'Welcome to Acorn...',
  IsNotFirstRun = 'Loading...',
  CreatingKeys = 'Creating cryptographic keys...',
  RegisteringDna = 'Registering Profiles DNA to Holochain...',
  InstallingApp = 'Installing DNA bundle to Holochain...',
  EnablingApp = 'Enabling DNA...',
  AddingAppInterface = 'Attaching API network port...',
}

export function stateSignalToText(state: StateSignal): StateSignalText {
  switch (state) {
    case StateSignal.IsFirstRun:
      return StateSignalText.IsFirstRun
    case StateSignal.IsNotFirstRun:
      return StateSignalText.IsNotFirstRun
    case StateSignal.CreatingKeys:
      return StateSignalText.CreatingKeys
    case StateSignal.RegisteringDna:
      return StateSignalText.RegisteringDna
    case StateSignal.InstallingApp:
      return StateSignalText.InstallingApp
    case StateSignal.EnablingApp:
      return StateSignalText.EnablingApp
    case StateSignal.AddingAppInterface:
      return StateSignalText.AddingAppInterface
  }
}

// NEEDS TO MATCH IN THE `web` folder source code
// `MAIN_APP_ID`
const MAIN_APP_ID = 'main-app'

const ACORN_AGENT_NUM = parseInt(process.env.ACORN_AGENT_NUM)
console.log('ACORN_AGENT_NUM', ACORN_AGENT_NUM)

const devOptions: ElectronHolochainOptions = {
  happPath: ACORN_HAPP_PATH, // preload
  datastorePath: DATASTORE_PATH,
  appId: MAIN_APP_ID,
  appWsPort: 8100 + ACORN_AGENT_NUM,
  adminWsPort: 1100 + ACORN_AGENT_NUM,
  keystorePath: KEYSTORE_PATH,
  passphrase: 'test-passphrase',
  bootstrapUrl: 'https://bootstrap.holo.host',
  logging: 'Json',
}
const prodOptions: ElectronHolochainOptions = {
  happPath: ACORN_HAPP_PATH, // preload
  datastorePath: DATASTORE_PATH,
  appId: MAIN_APP_ID,
  appWsPort: 8889,
  adminWsPort: 1235,
  keystorePath: KEYSTORE_PATH,
  passphrase: 'test-passphrase',
  bootstrapUrl: 'https://bootstrap.holo.host',
  logging: 'Json',
}

export { devOptions, prodOptions }
