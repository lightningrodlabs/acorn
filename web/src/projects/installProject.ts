import { AppClient, CellId, CreateCloneCellRequest } from '@holochain/client'
import { getAgentPubKey, getAppWs, getWeaveClient } from '../hcWebsockets'
import { PROJECT_APP_PREFIX, PROJECTS_ROLE_NAME } from '../holochainConfig'
import { passphraseToUid } from '../secrets'
import { CellIdString } from '../types/shared'
import { cellIdToString } from '../utils'
import { isWeaveContext } from '@theweave/api'

export async function internalInstallProject(
  passphrase: string,
  appWs: AppClient,
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

  // CLONE
  const createClonedCell = isWeaveContext()
    ? (arg: CreateCloneCellRequest) =>
        getWeaveClient().createCloneCell(arg, true)
    : appWs.createCloneCell
  const clonedCell = await createClonedCell({
    role_name: PROJECTS_ROLE_NAME,
    modifiers: {
      network_seed: uid,
    },
  })
  const cellId = clonedCell.cell_id
  const cellIdString = cellIdToString(cellId)
  //authorize zome calls for the new cell
  // TODO: this pattern will need to change as the adminWS won't be availabe in a Moss Tool context
  // if electron, send ipc message to main process to authorize, otherwise don't need to do anything
  return { cellIdString, cellId, appId: installedAppId }
}

export async function installProject(passphrase: string) {
  const appWs = await getAppWs()
  return internalInstallProject(passphrase, appWs, getAgentPubKey)
}
