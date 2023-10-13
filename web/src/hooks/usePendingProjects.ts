import { useEffect, useState } from 'react'
import { CellIdString } from '../types/shared'
import { getAllApps } from '../projectAppIds'
import { uidToPassphrase } from '../secrets'
import { CellType } from '@holochain/client'
import { getAgentPubKey, getAppWs } from '../hcWebsockets'
import { cellIdFromString } from '../utils'

export type PendingProject = {
  passphrase: string
  appId: string
  hasPeers: boolean
}
export type PendingProjectInfos = {
  [cellId: string]: PendingProject
}

const getNewInfos = async (
  projectCellIdStrings: CellIdString[]
): Promise<PendingProjectInfos> => {
  const allApps = await getAllApps()
  const appWs = await getAppWs()
  const agentPubKey = await getAgentPubKey()
  const networkInfos = agentPubKey ? await appWs.networkInfo({
    agent_pub_key: agentPubKey,
    dnas: projectCellIdStrings.map(cellIdFromString).map((cellId) => cellId[0]),
  }) : []
  const newInfos: PendingProjectInfos = {}
  projectCellIdStrings.forEach((projectCellId, index) => {
    const [appId, appInfo] = Object.entries(allApps).find(
      ([_appId, appInfo]) => appInfo.cellIdString === projectCellId
    )
    const cellInfo = Object.values(appInfo.cell_info)[0][0]
    const networkSeed =
      CellType.Provisioned in cellInfo
        ? cellInfo[CellType.Provisioned].dna_modifiers.network_seed
        : ''

    // time to check network info
    let hasPeers = false
    const networkInfo = networkInfos[index]
    if (networkInfo) {
      // 1 means 'only me'
      // 2 or more means currently active peers
      console.log('networkInfo', networkInfo)
      hasPeers = networkInfo.current_number_of_peers > 1
    }

    const appInfoForCellId = {
      passphrase: uidToPassphrase(networkSeed),
      appId,
      hasPeers
    }
    newInfos[projectCellId] = appInfoForCellId
  })
  return newInfos
}

export default function usePendingProjects(
  projectCellIdStrings: CellIdString[],
  fetchProjectMeta: (cellIdString: CellIdString) => Promise<void>
): {
  pendingProjects: PendingProjectInfos
  setPendingProjects: (pendingProjects: PendingProjectInfos) => void
} {
  const [pendingProjects, setPendingProjects] = useState<PendingProjectInfos>(
    {}
  )

  // handle the regular checking for those projects
  // that haven't synced yet
  useEffect(() => {
    const check = async () => {
      const stillPending = (
        await Promise.all(
          projectCellIdStrings.map(async (projectCellId) => {
            try {
              // fetchProjectMeta, if it succeeds
              // will automatically change the redux state since this
              // is a function wrapped in a dispatch call
              await fetchProjectMeta(projectCellId)
              return null
            } catch (e) {
              // project meta not found
              return projectCellId
            }
          })
        )
      )
        // only keep the ones that are still pending
        .filter((c) => c)
      // get the updated infos for the still pending projects
      const newInfos = await getNewInfos(stillPending)
      // return a result
      setPendingProjects(newInfos)
    }
    check()
    // check every 5 seconds for project meta
    const checkAgainInterval = setInterval(check, 5000)
    return () => {
      clearInterval(checkAgainInterval)
    }
  }, [JSON.stringify(projectCellIdStrings)])

  return {
    pendingProjects,
    setPendingProjects,
  }
}
