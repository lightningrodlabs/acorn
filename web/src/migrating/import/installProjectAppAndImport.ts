import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { installProject } from '../../projects/installProject'
import { setMember } from '../../redux/persistent/projects/members/actions'
import { simpleCreateProjectMeta } from '../../redux/persistent/projects/project-meta/actions'
import { AgentPubKeyB64 } from '../../types/shared'
import { cellIdFromString } from '../../utils'
import { ProjectExportDataV1 } from '../export'
import { cloneProjectMeta } from './cloneFunctions'
import { createActionHashMapAndImportProjectData } from './createActionHashMapAndImportProjectData'

export async function internalInstallProjectAppAndImport(
  agentAddress: AgentPubKeyB64,
  projectData: ProjectExportDataV1,
  passphrase: string,
  dispatch: any,
  _installProject: typeof installProject,
  _importProjectData: typeof createActionHashMapAndImportProjectData,
  projectsZomeApi: ProjectsZomeApi
) {
  
  // first step is to install the dna
  const [projectsCellIdString] = await _installProject(passphrase)
  const cellId = cellIdFromString(projectsCellIdString)
  
  // next step is to import the bulk of the data into that project
  const oldToNewAddressMaps = await _importProjectData(
    projectData,
    projectsCellIdString,
    dispatch
  )

  // next step is to add the project meta,
  // which is only done after the rest has been imported
  // so it doesn't list itself on the dashboard too
  // early in the process
  const projectMeta = cloneProjectMeta(
    oldToNewAddressMaps.outcomeActionHashMap,
    agentAddress,
    passphrase
  )(projectData.projectMeta)
  delete projectMeta.actionHash
  const simpleCreatedProjectMeta = await projectsZomeApi.projectMeta.simpleCreateProjectMeta(
    cellId,
    projectMeta
  )
  dispatch(
    simpleCreateProjectMeta(projectsCellIdString, simpleCreatedProjectMeta)
  )
  // this registers the agent to redux as a member of the project
  dispatch(setMember(projectsCellIdString, { agentPubKey: agentAddress }))

}

export async function installProjectAppAndImport(
  agentAddress: AgentPubKeyB64,
  projectData: ProjectExportDataV1,
  passphrase: string,
  dispatch: any,
) {
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  return internalInstallProjectAppAndImport(
    agentAddress,
    projectData,
    passphrase,
    dispatch,
    installProject,
    createActionHashMapAndImportProjectData,
    projectsZomeApi
  )
}
