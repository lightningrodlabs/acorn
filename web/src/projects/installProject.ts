import { AppClient, CellId, CreateCloneCellRequest } from '@holochain/client'
import { getAgentPubKey, getAppWs, getWeaveClient } from '../hcWebsockets'
import { PROJECT_APP_PREFIX, PROJECTS_ROLE_NAME } from '../holochainConfig'
import { passphraseToUid } from '../secrets'
import { CellIdString } from '../types/shared'
import { cellIdToString, fetchMyLocalProfile } from '../utils'
import { isWeaveContext } from '@theweave/api'
import ProfilesZomeApi from '../api/profilesApi'
import { WireRecord } from '../api/hdkCrud'
import { Profile } from 'zod-models'

export async function internalInstallProject(
  passphrase: string,
  appWs: AppClient,
  iGetAgentPubKey: typeof getAgentPubKey
): Promise<{
  cellIdString: CellIdString
  cellId: CellId
  whoami: WireRecord<Profile>
}> {
  const uid = passphraseToUid(passphrase)
  const agentKey = iGetAgentPubKey()
  if (!agentKey) {
    throw new Error(
      'Cannot install a new project because no AgentPubKey is known locally'
    )
  }
  // Check that local profile exists before cloning cell
  const myLocalProfile = await fetchMyLocalProfile()
  if (!myLocalProfile) {
    throw new Error('Cannot install new project because no Profile is set yet.')
  }

  // CLONE
  const clonedCell = await (async () => {
    const cloneConfig = {
      role_name: PROJECTS_ROLE_NAME,
      modifiers: {
        network_seed: uid,
      },
    }
    if (!isWeaveContext()) {
      return await appWs.createCloneCell(cloneConfig)
    }

    return await getWeaveClient().createCloneCell(cloneConfig, true)
  })()
  const cellId = clonedCell.cell_id
  const cellIdString = cellIdToString(cellId)

  // Create profile
  const profilesApi = new ProfilesZomeApi(appWs, cellId)
  const whoami = await profilesApi.profile.createWhoami(myLocalProfile)

  return { cellIdString, cellId, whoami }
}

/**
 * Installs a new project, i.e. a cloned cell of the projects dna and
 * creates a new Profile entry
 *
 * @param passphrase passphrase to use as the network seed of the project cell
 * @returns
 */
export async function installProject(passphrase: string) {
  const appWs = await getAppWs()
  return internalInstallProject(passphrase, appWs, getAgentPubKey)
}
