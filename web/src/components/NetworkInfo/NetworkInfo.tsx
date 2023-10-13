import React, { useEffect, useState } from 'react'
import './NetworkInfo.scss'
import { getAdminWs, getAppWs } from '../../hcWebsockets'
import ReactJsonView from 'react-json-view'
import { VersionInfo } from '../../hooks/useVersionChecker'

export type NetworkInfoProps = {
  versionInfo: VersionInfo
}

const NetworkInfo: React.FC<NetworkInfoProps> = (
  {
    versionInfo
  }
) => {
  const [networkStats, setNetworkStats] = useState({})

  useEffect(() => {
    const getNetworkStats = async () => {
      const adminWs = await getAdminWs()
      const stats = await adminWs.dumpNetworkStats()
      setNetworkStats(JSON.parse(stats))
    }
    getNetworkStats()

    // repeat every 5 seconds
    const interval = setInterval(() => getNetworkStats(), 5000)
    return () => clearInterval(interval)
  }, [])

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
    </div>
  )
}

export default NetworkInfo
