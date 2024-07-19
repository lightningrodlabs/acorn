import { AppClient } from '@holochain/client'
import ProfilesZomeApi from '../../api/profilesApi'
import ProjectsZomeApi from '../../api/projectsApi'

export function createProfilesZomeApi(
  appWebsocket: AppClient
): ProfilesZomeApi {
  return new ProfilesZomeApi(appWebsocket)
}
export function createProjectsZomeApi(
  appWebsocket: AppClient
): ProjectsZomeApi {
  return new ProjectsZomeApi(appWebsocket)
}
