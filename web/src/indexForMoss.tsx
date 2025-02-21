import { AppClient, CellType } from '@holochain/client'

// Local Imports
import { PROJECTS_ROLE_NAME } from './holochainConfig'
import {
  setProfilesCellId,
  setProjectsCellIds,
} from './redux/persistent/cells/actions'
import { fetchAgents } from './redux/persistent/profiles/agents/actions'
import { whoami } from './redux/persistent/profiles/who-am-i/actions'
import { fetchAgentAddress } from './redux/persistent/profiles/agent-address/actions'
import { getWeaveProfilesClient, setAgentPubKey } from './hcWebsockets'
import { getProjectCellIdStrings } from './projectAppIds'
import ProfilesZomeApi from './api/profilesApi'
import { cellIdToString } from './utils'

// Import styles
import './variables.scss'
import './global.scss'
import { isWeaveContext } from '@theweave/api'
import { ProfilesClient } from '@holochain-open-dev/profiles'

export async function mossInit(
  store: any,
  profilesClient: ProfilesClient,
  appWs: AppClient
) {
  try {
    const appInfo = await appWs.appInfo()
    profilesClient.roleName
    const profilesInfo = await profilesClient.client.appInfo()
    const { profilesCellInfo, projectsCellInfo } = {
      profilesCellInfo: profilesInfo.cell_info[profilesClient.roleName][0],
      projectsCellInfo: appInfo.cell_info[PROJECTS_ROLE_NAME][0],
    }

    const { cellId, projectsCellId } = {
      cellId:
        CellType.Provisioned in profilesCellInfo
          ? profilesCellInfo[CellType.Provisioned].cell_id
          : undefined,
      projectsCellId:
        CellType.Provisioned in projectsCellInfo
          ? projectsCellInfo[CellType.Provisioned].cell_id
          : undefined,
    }
    if (cellId == undefined || projectsCellId == undefined) {
      throw 'cellId undefined'
    } else {
      const [_dnaHash, agentPubKey] = cellId
      // cache buffer version of agentPubKey
      setAgentPubKey(agentPubKey)
      const cellIdString = cellIdToString(cellId)
      store.dispatch(setProfilesCellId(cellIdString))
      const profilesZomeApi = await (async () => {
        if (isWeaveContext()) {
          const profilesClient = await getWeaveProfilesClient()
          return new ProfilesZomeApi(appWs, profilesClient)
        } else {
          return new ProfilesZomeApi(appWs)
        }
      })()

      const profiles = await profilesZomeApi.profile.fetchAgents(cellId)
      store.dispatch(fetchAgents(cellIdString, profiles))
      const profile = await profilesZomeApi.profile.whoami(cellId)
      // this allows us to 'reclaim' a profile that was imported by someone else that is ours
      // (i.e. it relates to our public key)
      if (profile) {
        let nonImportedProfile = {
          ...profile.entry,
          isImported: false,
        }
        await profilesZomeApi.profile.updateWhoami(cellId, {
          entry: nonImportedProfile,
          actionHash: profile.actionHash,
        })
        profile.entry = nonImportedProfile
      }
      store.dispatch(whoami(cellIdString, profile))
      const agentAddress = await profilesZomeApi.profile.fetchAgentAddress(
        cellId
      )
      store.dispatch(fetchAgentAddress(cellIdString, agentAddress))
      // which projects do we have installed?
      const projectCellIds = await getProjectCellIdStrings()

      // before any zome calls can be made, we need to gain zome call signing authorization
      // for each of the project cells that we have installed
      store.dispatch(setProjectsCellIds(projectCellIds))
    }
  } catch (e) {
    console.error(e)
  }
}
