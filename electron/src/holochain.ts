import * as childProcess from 'child_process'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as split from 'split'

enum StateSignal {
  IsFirstRun,
  IsNotFirstRun,
  CreatingKeys,
  RegisteringDna,
  InstallingApp,
  ActivatingApp,
  SettingUpCells,
  AddingAppInterface,
  IsReady,
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

const constructOptions = (): string[] => {
  return ['']
}

const runHolochain = async (): Promise<void> => {
  // const options = constructOptions()
  const holochainHandle = childProcess.spawn(`../acorn`, [])
  return new Promise<void>((resolve, reject) => {
    // split divides up the stream line by line
    holochainHandle.stdout.pipe(split()).on('data', (line: string) => {
      console.log(line)
      const checkIfSignal = stdoutToStateSignal(line)
      switch (checkIfSignal) {
        case StateSignal.IsReady:
          resolve()
      }
    })
    holochainHandle.stdout.on('error', (e) => {
      console.log(e)
      // reject()
    })
    holochainHandle.stderr.on('data', (e) => {
      console.log(e.toString())
      // reject()
    })
  })
}

export { runHolochain }
