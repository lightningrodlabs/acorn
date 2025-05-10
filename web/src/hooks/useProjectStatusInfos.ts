import { useEffect, useState } from 'react'
import { CellIdString } from '../types/shared'
import { uidToPassphrase } from '../secrets'
import { CellType, ClonedCell, encodeHashToBase64 } from '@holochain/client'
import { getAgentPubKey, getAppWs } from '../hcWebsockets'
import { cellIdFromString, cellIdToString } from '../utils'

export type ProjectStatusInfo = {
  passphrase: string
  appId: string
  hasPeers: boolean
  isGossiping: boolean
  hasProjectMeta: boolean
}
export type ProjectStatusInfos = {
  [cellId: string]: ProjectStatusInfo
}

const getNewInfos = async (
  projects: { cellId: CellIdString; hasProjectMeta: boolean }[]
): Promise<ProjectStatusInfos> => {
  const appWs = await getAppWs()
  const appInfo = await appWs.appInfo()
  const agentPubKey = await getAgentPubKey()
  const networkInfos = agentPubKey
    ? await appWs.dumpNetworkMetrics({ include_dht_summary: false })
    : undefined
  const clonedProjectCells: ClonedCell[] = appInfo.cell_info['projects']
    .filter(
      (cellInfo) => CellType.Cloned === cellInfo.type && cellInfo.value.enabled
    )
    .map((cellInfo) => cellInfo.value as ClonedCell)

  const newInfos: ProjectStatusInfos = {}
  projects.forEach(({ cellId, hasProjectMeta }, index) => {
    const cellInfo = clonedProjectCells.find(
      (clonedCell) => cellIdToString(clonedCell.cell_id) === cellId
    )
    if (!cellInfo) {
      return
    }

    // time to check network info
    let hasPeers = false
    let isGossiping = false

    const dnaHashString = encodeHashToBase64(cellInfo.cell_id[0])

    const networkInfo = networkInfos[dnaHashString]
    if (networkInfo) {
      // 1 means 'only me'
      // 2 or more means currently active peers
      hasPeers = networkInfo.local_agents.length > 1
      isGossiping =
        Object.values(networkInfo.fetch_state_summary.pending_requests).flat
          .length > 0
    }
    newInfos[cellId] = {
      passphrase: uidToPassphrase(cellInfo.dna_modifiers.network_seed),
      appId: appInfo.installed_app_id,
      hasPeers,
      isGossiping,
      hasProjectMeta,
    }
  })
  return newInfos
}

export default function usePendingProjects(
  projectCellIdStrings: CellIdString[],
  fetchProjectMeta: (cellIdString: CellIdString) => Promise<void>,
  fetchMembers: (cellIdString: CellIdString) => Promise<void>,
  fetchEntryPointDetails: (cellIdString: CellIdString) => Promise<void>
): {
  projectStatusInfos: ProjectStatusInfos
  setProjectStatusInfos: (pendingProjects: ProjectStatusInfos) => void
} {
  const [
    projectStatusInfos,
    setProjectStatusInfos,
  ] = useState<ProjectStatusInfos>({})

  // handle the regular checking for those projects
  // that haven't synced yet
  useEffect(() => {
    const check = async () => {
      try {
        const withHasProjectMetas = await Promise.all(
          projectCellIdStrings.map(async (projectCellId) => {
            try {
              // fetchProjectMeta, if it succeeds
              // will automatically change the redux state since this
              // is a function wrapped in a dispatch call
              await fetchProjectMeta(projectCellId)
              // if projectMeta succeeds, then also fetch members and entry points,
              // but don't await them as they're not crucial
              fetchEntryPointDetails(projectCellId)
              fetchMembers(projectCellId)
              return {
                cellId: projectCellId,
                hasProjectMeta: true,
              }
            } catch (e) {
              // project meta not found
              return {
                cellId: projectCellId,
                hasProjectMeta: false,
              }
            }
          })
        )
        // mix in the the network infos for all projects
        const newInfos = await getNewInfos(withHasProjectMetas)
        // return a result
        setProjectStatusInfos(newInfos)
      } catch (e) {
        console.error(e)
      }
    }
    check()
    // check every 5 seconds for project meta
    const checkAgainInterval = setInterval(check, 5000)
    return () => {
      clearInterval(checkAgainInterval)
    }
  }, [JSON.stringify(projectCellIdStrings)])

  return {
    projectStatusInfos,
    setProjectStatusInfos,
  }
}
