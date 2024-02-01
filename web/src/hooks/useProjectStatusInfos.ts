import { useEffect, useState } from 'react'
import { CellIdString } from '../types/shared'
import { getAllApps } from '../projectAppIds'
import { uidToPassphrase } from '../secrets'
import { CellType } from '@holochain/client'
import { getAgentPubKey } from '../hcWebsockets'
import { cellIdFromString } from '../utils'

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
  // TODOOOO
  return {}
  const allApps = await getAllApps()
  const agentPubKey = await getAgentPubKey()
  const networkInfos = agentPubKey
    ? await appWebsocket.networkInfo({
        agent_pub_key: agentPubKey,
        dnas: projects.map(({ cellId }) => cellIdFromString(cellId)[0]),
      })
    : []
  const newInfos: ProjectStatusInfos = {}
  projects.forEach(({ cellId, hasProjectMeta }, index) => {
    const app = Object.entries(allApps).find(
      ([_appId, appInfo]) => appInfo.cellIdString === cellId
    )
    // This can happen if the project just got uninstalled
    if (!app) {
      return
    }
    const [appId, appInfo] = app
    const cellInfo = Object.values(appInfo.cell_info)[0][0]
    const networkSeed =
      CellType.Provisioned in cellInfo
        ? cellInfo[CellType.Provisioned].dna_modifiers.network_seed
        : ''

    // time to check network info
    let hasPeers = false
    let isGossiping = false
    const networkInfo = networkInfos[index]
    if (networkInfo) {
      // 1 means 'only me'
      // 2 or more means currently active peers
      hasPeers = networkInfo.current_number_of_peers > 1
      isGossiping = networkInfo.fetch_pool_info.num_ops_to_fetch > 0
    }
    newInfos[cellId] = {
      passphrase: uidToPassphrase(networkSeed),
      appId,
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
