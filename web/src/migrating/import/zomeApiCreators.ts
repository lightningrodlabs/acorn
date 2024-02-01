import { AppAgentClient } from '@holochain/client'
import ProfilesZomeApi from '../../api/profilesApi'
import ProjectsZomeApi from '../../api/projectsApi'

export function createProfilesZomeApi(
  appWebsocket: AppAgentClient
): ProfilesZomeApi {
  return new ProfilesZomeApi(appWebsocket)
}
export function createProjectsZomeApi(
  appWebsocket: AppAgentClient
): ProjectsZomeApi {
  return new ProjectsZomeApi(appWebsocket)
}
