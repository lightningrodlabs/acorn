import { useEffect, useState } from 'react'

export default function useHolochainErrorAndLog() {
  const [wasmLogs, setWasmLogs] = useState<string[]>([])
  const [holochainInfo, setHolochainInfo] = useState<object[]>([])
  const [holochainWarn, setHolochainWarn] = useState<object[]>([])
  const [holochainDebug, setHolochainDebug] = useState<object[]>([])
  const [holochainError, setHolochainError] = useState<object[]>([])
  const [holochainUnknown, setHolochainUnknown] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const subscribeToEvents = async () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('wasmLog', (event: object, log: string) => {
        setWasmLogs((logs) => [...logs, log])
      })
      ipcRenderer.on('holochainLog', (event: object, log: string) => {
        try {
          let parsedLog: object = JSON.parse(log)
          if (parsedLog['level'] === 'INFO') {
            setHolochainInfo((logs) => [...logs, parsedLog])
          } else if (parsedLog['level'] === 'WARN') {
            setHolochainWarn((logs) => [...logs, parsedLog])
          } else if (parsedLog['level'] === 'DEBUG') {
            setHolochainDebug((logs) => [...logs, parsedLog])
          } else if (parsedLog['level'] === 'ERROR') {
            setHolochainError((logs) => [...logs, parsedLog])
          }
        } catch (e) {
          setHolochainUnknown((logs) => [...logs, log])
        }
      })
      ipcRenderer.on('holochainError', (event: object, error: string) => {
        setErrors((errors) => [...errors, error])
      })
    }
  }

  useEffect(() => {
    subscribeToEvents()
  }, [])

  return {
    wasmLogs,
    holochainLogs: {
      info: holochainInfo,
      warn: holochainWarn,
      debug: holochainDebug,
      error: holochainError,
      unknown: holochainUnknown,
    },
    errors,
  }
}
