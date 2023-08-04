import { AppWebsocket } from '@holochain/client'
import ProfilesZomeApi from '../../api/profilesApi'
import ProjectsZomeApi from '../../api/projectsApi'

export function createProfilesZomeApi(
  appWebsocket: AppWebsocket
): ProfilesZomeApi {
  return new ProfilesZomeApi(appWebsocket)
}
export function createProjectsZomeApi(
  appWebsocket: AppWebsocket
): ProjectsZomeApi {
  return new ProjectsZomeApi(appWebsocket)
}
