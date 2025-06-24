import { AppClient, encodeHashToBase64 } from '@holochain/client'

// Local Imports
import { setProjectsCellIds } from './redux/persistent/cells/actions'
import { setAgentPubKey } from './hcWebsockets'
import { getProjectCellIdStrings } from './projectAppIds'
import ProfilesZomeApi from './api/profilesApi'
import {
  cellIdFromString,
  fetchMyLocalProfile,
  readMyLocalProfile,
} from './utils'

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

    // fetch the profile from weave profiles client
    const myLocalProfile = await fetchMyLocalProfile()
    store.dispatch(setMyLocalProfile(myLocalProfile))

    // Compare our profile with the ones that we stored in each respective
    // project dna and create or update as necessary
    const projectCellIds = await getProjectCellIdStrings(appInfo)
    await Promise.all(
      projectCellIds.map(async (cellIdString) => {
        const profilesZomeApi = new ProfilesZomeApi(
          appWs,
          cellIdFromString(cellIdString)
        )
        const currentProfile = await profilesZomeApi.profile.whoami()
        if (!currentProfile) {
          await profilesZomeApi.profile.createWhoami(myLocalProfile);
        } else if (
          JSON.stringify(currentProfile.entry) !==
          JSON.stringify(myLocalProfile)
        ) {
          await profilesZomeApi.profile.updateWhoami({
            actionHash: currentProfile.actionHash,
            entry: myLocalProfile,
          })
        }
      })
    )

    // Fetch the profiles for all projects. Note that we still fetch them from
    // the project dnas despite profiles being provided by Moss as well.
    // That's so that we can also see profiles of project members using
    // Acorn Desktop.
    store.dispatch(setProjectsCellIds(projectCellIds))
    await Promise.all(
      projectCellIds.map(async (cellIdString) => {
        const profilesZomeApi = new ProfilesZomeApi(
          appWs,
          cellIdFromString(cellIdString)
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
