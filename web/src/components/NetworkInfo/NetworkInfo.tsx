import React, { useEffect, useState } from 'react'
import './NetworkInfo.scss'
import { getAdminWs } from '../../hcWebsockets'
import ReactJsonView from 'react-json-view'

export type NetworkInfoProps = {
  // proptypes
}

const NetworkInfo: React.FC<NetworkInfoProps> = (
  {
    // prop declarations
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
      <div className="network-info-context">updates every 5 seconds</div>
      <ReactJsonView src={networkStats} />
    </div>
  )
}

export default NetworkInfo
