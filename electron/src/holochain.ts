import * as childProcess from 'child_process'
import * as path from 'path'
import { EventEmitter } from 'events'
import log from 'electron-log'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as split from 'split'
import { app } from 'electron'

// these messages get seen on the splash page
enum StateSignal {
  IsFirstRun = 'Welcome to Acorn...',
  IsNotFirstRun = 'Loading...',
  CreatingKeys = 'Creating cryptographic keys...',
  RegisteringDna = 'Registering Profiles DNA to Holochain...',
  InstallingApp = 'Installing DNA bundle to Holochain...',
  ActivatingApp = 'Activating DNA bundle...',
  SettingUpCells = 'Writing first entries to source chain...',
  AddingAppInterface = 'Attaching API network port...',
  // this one doesn't show to UI, it's
  // used to close the splash screen and launch the main window
  IsReady = 'IsReady',
}

function stdoutToStateSignal(string: string): StateSignal {
  switch (string) {
    case '0':
      return StateSignal.IsFirstRun
    case '1':
      return StateSignal.IsNotFirstRun
    // IsFirstRun events
    case '2':
      return StateSignal.CreatingKeys
    case '3':
      return StateSignal.RegisteringDna
    case '4':
      return StateSignal.InstallingApp
    case '5':
      return StateSignal.ActivatingApp
    case '6':
      return StateSignal.SettingUpCells
    case '7':
      return StateSignal.AddingAppInterface
    // Done/Ready Event
    case '8':
      return StateSignal.IsReady
    default:
      return null
  }
}

const MAIN_APP_ID = 'main-app'
const COMMUNITY_PROXY_URL =
  'kitsune-proxy://SYVd4CF3BdJ4DS7KwLLgeU3_DbHoZ34Y-qroZ79DOs8/kitsune-quic/h/165.22.32.11/p/5779/--'

const devOptions: HolochainOptions = {
  datastorePath: '../tmp/databases',
  appId: MAIN_APP_ID,
  appWsPort: 8888,
  adminWsPort: 1234,
  keystorePath: '../tmp/keystore',
  proxyUrl: COMMUNITY_PROXY_URL,
}
const prodOptions: HolochainOptions = {
  datastorePath: path.join(app.getPath('userData'), 'databases'),
  appId: MAIN_APP_ID,
  appWsPort: 8889,
  adminWsPort: 1235,
  keystorePath: path.join(app.getPath('userData'), 'keystore'),
  proxyUrl: COMMUNITY_PROXY_URL,
}

const constructOptions = (options: HolochainOptions): string[] => {
  return [
    '--app-id',
    options.appId,
    '--app-ws-port',
    options.appWsPort.toString(),
    '--admin-ws-port',
    options.adminWsPort.toString(),
    '--keystore-path',
    options.keystorePath,
    '--proxy-url',
    options.proxyUrl,
    options.datastorePath,
  ]
}

interface HolochainOptions {
  datastorePath: string
  appId: string
  appWsPort: number
  adminWsPort: number
  keystorePath: string
  proxyUrl: string
}

const runHolochain = async (
  emitter: EventEmitter,
  options: HolochainOptions,
  holochainBinaryPath: string,
  lairBinaryPath: string
): Promise<childProcess.ChildProcessWithoutNullStreams[]> => {
  const lairHandle = childProcess.spawn(lairBinaryPath, [
    '--lair-dir',
    options.keystorePath,
  ])
  const optionsArray = constructOptions(options)
  const holochainHandle = childProcess.spawn(holochainBinaryPath, optionsArray)
  return new Promise<childProcess.ChildProcessWithoutNullStreams[]>(
    (resolve, reject) => {
      // split divides up the stream line by line
      holochainHandle.stdout.pipe(split()).on('data', (line: string) => {
        log.info(line)
        const checkIfSignal = stdoutToStateSignal(line)
        if (checkIfSignal === StateSignal.IsReady) {
          resolve([lairHandle, holochainHandle])
        } else if (checkIfSignal !== null) {
          emitter.emit('status', checkIfSignal)
        }
      })
      holochainHandle.stdout.on('error', (e) => {
        log.error(e)
        // reject()
      })
      holochainHandle.stderr.on('data', (e) => {
        log.error(e.toString())
        // reject()
      })
    }
  )
}

export { devOptions, prodOptions, runHolochain, StateSignal }
