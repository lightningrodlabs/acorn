import ProjectsZomeApi from '../../api/projectsApi'
import { finalizeCreateProject } from '../../projects/createProject'
import { getAppWs } from '../../hcWebsockets'
import { installProject } from '../../projects/installProject'
import { AgentPubKeyB64 } from '../../types/shared'
import { ProjectExportDataV1 } from '../export'
import { cloneProjectMeta } from './cloneFunctions'
import { createActionHashMapAndImportProjectData } from './createActionHashMapAndImportProjectData'

export async function internalInstallProjectAndImport(
  agentAddress: AgentPubKeyB64,
  projectData: ProjectExportDataV1,
  passphrase: string,
  dispatch: any,
  iInstallProject: typeof installProject,
  iCreateActionHashMapAndImportProjectData: typeof createActionHashMapAndImportProjectData,
  iFinalizeCreateProject: typeof finalizeCreateProject,
  projectsZomeApi: ProjectsZomeApi
) {
  
  // first step is to install the dna
  const [cellIdString] = await iInstallProject(passphrase)
  
  // next step is to import the bulk of the data into that project
  const oldToNewAddressMaps = await iCreateActionHashMapAndImportProjectData(
    projectData,
    cellIdString,
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
  await iFinalizeCreateProject(
    cellIdString,
    projectMeta,
    agentAddress,
    dispatch,
    projectsZomeApi
  )
}

export async function installProjectAndImport(
  agentAddress: AgentPubKeyB64,
  projectData: ProjectExportDataV1,
  passphrase: string,
  dispatch: any,
) {
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  return internalInstallProjectAndImport(
    agentAddress,
    projectData,
    passphrase,
    dispatch,
    installProject,
    createActionHashMapAndImportProjectData,
    finalizeCreateProject,
    projectsZomeApi
  )
}
