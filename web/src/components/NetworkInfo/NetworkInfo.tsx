import React, { useEffect, useState } from 'react'
import './NetworkInfo.scss'
import { getAdminWs } from '../../hcWebsockets'
import ReactJsonView from 'react-json-view'
import { VersionInfo } from '../../hooks/useVersionChecker'
import { isWeContext } from '@lightningrodlabs/we-applet'

export type NetworkInfoProps = {
  versionInfo: VersionInfo
  wasmLogs: string[]
  holochainLogs: {
    info: object[]
    warn: object[]
    error: object[]
    debug: object[]
    unknown: string[]
  }
  errors: string[]
}

enum LogsToShow {
  Info = 'Info',
  Warn = 'Warn',
  Debug = 'Debug',
  Error = 'Error',
  Unknown = 'Unknown',
}

const NetworkInfo: React.FC<NetworkInfoProps> = ({
  versionInfo,
  holochainLogs,
  wasmLogs,
  errors,
}) => {
  const [networkStats, setNetworkStats] = useState({})
  const [logsToShow, setLogsToShow] = useState<LogsToShow>(LogsToShow.Info)

  useEffect(() => {
    const getNetworkStats = async () => {
      if (!isWeContext()) {
        const adminWs = await getAdminWs()
        const stats = await adminWs.dumpNetworkStats()
        setNetworkStats(JSON.parse(stats))
      }
    }
    getNetworkStats()

    // repeat every 5 seconds
    const interval = setInterval(() => getNetworkStats(), 5000)
    return () => clearInterval(interval)
  }, [])

  const logs =
    holochainLogs[logsToShow.toLowerCase() as keyof typeof holochainLogs]

  return (
    <div className="network-info">
      <div className="network-info-context">
        Acorn {versionInfo.currentVersion}
        <br />
        Databases/integrity folder version: {versionInfo.integrityVersion}
        <br />
        Keystore folder version: {versionInfo.keystoreFolderVersion}
        <br />
        holochain version 0.2.2
        <br />
        bootstrap: https://bootstrap.holo.host
        <br />
        signal: wss://signal.holo.host
        <br />
        updates every 5 seconds
      </div>
      <ReactJsonView src={networkStats} />

      <h3>Errors</h3>
      {errors.map((error) => (
        <p>{error}</p>
      ))}

      <h3>Wasm Logs</h3>

      {wasmLogs.map((log) => (
        <p>{log}</p>
      ))}
      <h3>Holochain Logs</h3>
      <button onClick={() => setLogsToShow(LogsToShow.Info)}>Info</button>
      <button onClick={() => setLogsToShow(LogsToShow.Warn)}>Warn</button>
      <button onClick={() => setLogsToShow(LogsToShow.Debug)}>Debug</button>
      <button onClick={() => setLogsToShow(LogsToShow.Error)}>Error</button>
      <button onClick={() => setLogsToShow(LogsToShow.Unknown)}>Unknown</button>
      <h3>{logsToShow} Logs</h3>
      {logs.map((log: string | object, index: number) => {
        return (
          <p
            key={`${logsToShow}${index}`}
            style={{
              overflowWrap: 'break-word',
              margin: '4px 0',
              fontSize: '12px',
              fontWeight: 'normal',
            }}
          >
            {typeof log === 'object'
              ? log['fields']['message'] ||
                log['fields']['msg'] ||
                log['fields']['err']
              : log}
            {'\n'}({typeof log === 'object' ? log['module_path'] : ''})
          </p>
        )
      })}
    </div>
  )
}

export default NetworkInfo
