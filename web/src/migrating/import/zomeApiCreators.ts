import { AppClient } from '@holochain/client'
import ProfilesZomeApi from '../../api/profilesApi'
import ProjectsZomeApi from '../../api/projectsApi'
import { isWeaveContext } from '@theweave/api'
import { getWeaveProfilesClient } from '../../hcWebsockets'

export async function createProfilesZomeApi(
  appWebsocket: AppClient
): Promise<ProfilesZomeApi> {
  return await (async () => {
    if (isWeaveContext()) {
      const profilesClient = await getWeaveProfilesClient()
      return new ProfilesZomeApi(appWebsocket, profilesClient)
    } else return new ProfilesZomeApi(appWebsocket)
  })()
}
export function createProjectsZomeApi(
  appWebsocket: AppClient
): ProjectsZomeApi {
  return new ProjectsZomeApi(appWebsocket)
}
