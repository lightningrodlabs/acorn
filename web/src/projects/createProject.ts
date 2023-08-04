import { AgentPubKeyB64 } from '@holochain/client'
import ProjectsZomeApi from '../api/projectsApi'
import { setMember } from '../redux/persistent/projects/members/actions'
import { simpleCreateProjectMeta } from '../redux/persistent/projects/project-meta/actions'
import { ProjectMeta } from '../types'
import { cellIdFromString } from '../utils'
import { installProject } from './installProject'

export async function createProject(
  passphrase: string,
  projectMeta: ProjectMeta,
  agentAddress: AgentPubKeyB64,
  dispatch: any,
  projectsZomeApi: ProjectsZomeApi
) {
  const startTime = Date.now()
  const [cellIdString] = await installProject(passphrase)
  const cellId = cellIdFromString(cellIdString)
  const createdProjectMeta = await projectsZomeApi.projectMeta.simpleCreateProjectMeta(
    cellId,
    projectMeta
  )
  dispatch(simpleCreateProjectMeta(cellIdString, createdProjectMeta))
  // because we are acting optimistically,
  // we will directly set ourselves as a member of this cell
  dispatch(setMember(cellIdString, { agentPubKey: agentAddress }))
  const endTime = Date.now()
  console.log('duration in MS over createProject ', endTime - startTime)
  return cellIdString
}
