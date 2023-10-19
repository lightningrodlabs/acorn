import { AdminWebsocket, CellId, CellType } from '@holochain/client'
import { getAdminWs, getAgentPubKey } from '../hcWebsockets'
import { PROJECT_APP_PREFIX } from '../holochainConfig'
import { passphraseToUid } from '../secrets'
import { CellIdString } from '../types/shared'
import { cellIdToString } from '../utils'

export async function internalInstallProject(
  passphrase: string,
  adminWs: AdminWebsocket,
  iGetAgentPubKey: typeof getAgentPubKey
): Promise<{ cellIdString: CellIdString; cellId: CellId; appId: string }> {
  const uid = passphraseToUid(passphrase)
  const installedAppId = `${PROJECT_APP_PREFIX}-${uid}`
  const agentKey = iGetAgentPubKey()
  if (!agentKey) {
    throw new Error(
      'Cannot install a new project because no AgentPubKey is known locally'
    )
  }
  // the dna hash HAS to act deterministically
  // in order for the 'joining' of Projects to work
  let happPath: string
  if (typeof window !== 'undefined' && window.require)
    happPath = await window
      .require('electron')
      .ipcRenderer.invoke('getProjectsPath')
  else happPath = './happ/workdir/projects/projects.happ'

  // INSTALL
  const installedApp = await adminWs.installApp({
    agent_key: agentKey,
    installed_app_id: installedAppId,
    membrane_proofs: {},
    path: happPath,
    network_seed: uid,
  })
  const cellInfo = Object.values(installedApp.cell_info)[0][0]
  let cellId: CellId
  if (CellType.Provisioned in cellInfo) {
    cellId = cellInfo[CellType.Provisioned].cell_id
  } else {
    throw new Error('Could not find a provisioned cell in the installed app')
  }
  const cellIdString = cellIdToString(cellId)
  await adminWs.enableApp({ installed_app_id: installedAppId })
  //authorize zome calls for the new cell
  await adminWs.authorizeSigningCredentials(cellId)
  return { cellIdString, cellId, appId: installedAppId }
}

export async function installProject(
  passphrase: string
) {
  const adminWs = await getAdminWs()
  return internalInstallProject(passphrase, adminWs, getAgentPubKey)
}
