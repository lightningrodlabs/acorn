import { AppClient, encodeHashToBase64 } from '@holochain/client'

// Local Imports
import { setProjectsCellIds } from './redux/persistent/cells/actions'
import { setAgentPubKey } from './hcWebsockets'
import { getProjectCellIdStrings } from './projectAppIds'
import ProfilesZomeApi from './api/profilesApi'
import { cellIdFromString, fetchMyLocalProfile, readMyLocalProfile } from './utils'

// Import styles
import './variables.scss'
import './global.scss'
import { ProfilesClient } from '@holochain-open-dev/profiles'
import { WeaveClientRenderInfo } from './weave/WeaveClientRenderInfo'
import App from './routes/App.connector'
import OutcomeAssetView from './weave/OutcomeAssetView'
import ProjectAssetView from './weave/ProjectAssetView'
import { fetchProjectProfiles } from './redux/persistent/projects/members/actions'
import { setAgentAddress } from './redux/persistent/profiles/agent-address/actions'
import { setMyLocalProfile } from './redux/persistent/profiles/my-local-profile/actions'

export async function mossInit(
  store: any,
  profilesClient: ProfilesClient,
  appWs: AppClient
) {
  try {
    const appInfo = await appWs.appInfo()

    // cache buffer version of agentPubKey
    setAgentPubKey(appInfo.agent_pub_key)

    // read the local profile from localStorage and set it in the state
    const myLocalProfile = await fetchMyLocalProfile();
    store.dispatch(setMyLocalProfile(myLocalProfile))

    // fetch the profiles for all projects
    const projectCellIds = await getProjectCellIdStrings(appInfo)
    store.dispatch(setProjectsCellIds(projectCellIds))

    await Promise.all(
      projectCellIds.map(async (cellIdString) => {
        const profilesZomeApi = new ProfilesZomeApi(
          appWs,
          cellIdFromString(cellIdString),
          profilesClient
        )
        const profiles = await profilesZomeApi.profile.fetchAgents()
        store.dispatch(fetchProjectProfiles(cellIdString, profiles))
      })
    )
    store.dispatch(setAgentAddress(encodeHashToBase64(appInfo.agent_pub_key)))
  } catch (e) {
    console.error(e)
  }
}

export function getComponentAndPropsForRenderMode(
  renderInfo: WeaveClientRenderInfo
): {
  rootElement: React.ElementType
  rootProps?: Record<string, any>
} {
  if (renderInfo.isMainView()) {
    return {
      rootElement: App,
      rootProps: {
        appWebsocket: renderInfo.getAppletClient(),
      },
    }
  }
  if (renderInfo.isOutcomeView()) {
    const outcomeWal = renderInfo.getOutcomeWal()

    return {
      rootElement: OutcomeAssetView,
      rootProps: {
        wal: outcomeWal,
      },
    }
  }
  if (renderInfo.isProjectView()) {
    const projectWal = renderInfo.getProjectWal()
    return {
      rootElement: ProjectAssetView,
      rootProps: {
        wal: projectWal,
      },
    }
  }
  throw new Error(
    'This Applet only implements the applet main view and the asset view.'
  )
}
