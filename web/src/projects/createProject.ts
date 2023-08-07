import { AgentPubKeyB64 } from '@holochain/client'
import ProjectsZomeApi from '../api/projectsApi'
import { setMember } from '../redux/persistent/projects/members/actions'
import { simpleCreateProjectMeta } from '../redux/persistent/projects/project-meta/actions'
import { ProjectMeta } from '../types'
import { cellIdFromString } from '../utils'
import { installProject } from './installProject'
import { CellIdString } from '../types/shared'

export async function finalizeCreateProject(
  cellIdString: CellIdString,
  projectMeta: ProjectMeta,
  agentAddress: AgentPubKeyB64,
  dispatch: any,
  projectsZomeApi: ProjectsZomeApi
) {
  const cellId = cellIdFromString(cellIdString)
  const createdProjectMeta = await projectsZomeApi.projectMeta.simpleCreateProjectMeta(
    cellId,
    projectMeta
  )
  dispatch(simpleCreateProjectMeta(cellIdString, createdProjectMeta))
  // because we are acting optimistically,
  // we will directly set ourselves as a member of this cell
  dispatch(setMember(cellIdString, { agentPubKey: agentAddress }))
}

export async function internalCreateProject(
  passphrase: string,
  projectMeta: ProjectMeta,
  agentAddress: AgentPubKeyB64,
  dispatch: any,
  iInstallProject: typeof installProject,
  projectsZomeApi: ProjectsZomeApi
) {
  const startTime = Date.now()
  const [cellIdString] = await iInstallProject(passphrase)
  await finalizeCreateProject(
    cellIdString,
    projectMeta,
    agentAddress,
    dispatch,
    projectsZomeApi
  )
  const endTime = Date.now()
  console.log('duration in MS over createProject ', endTime - startTime)
  return cellIdString
}

export async function createProject(
  passphrase: string,
  projectMeta: ProjectMeta,
  agentAddress: AgentPubKeyB64,
  dispatch: any,
  projectsZomeApi: ProjectsZomeApi
) {
  return internalCreateProject(
    passphrase,
    projectMeta,
    agentAddress,
    dispatch,
    installProject,
    projectsZomeApi
  )
}
