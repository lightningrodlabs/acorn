import { AppClient } from '@holochain/client'
import ProjectsZomeApi from '../../api/projectsApi'

export function createProjectsZomeApi(
  appWebsocket: AppClient
): ProjectsZomeApi {
  return new ProjectsZomeApi(appWebsocket)
}
