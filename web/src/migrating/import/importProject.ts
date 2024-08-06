import { BackwardsCompatibleProjectExport } from 'zod-models'
import ProjectsZomeApi from '../../api/projectsApi'
import { finalizeCreateProject } from '../../projects/createProject'
import { getAppWs } from '../../hcWebsockets'
import { AgentPubKeyB64, CellIdString } from '../../types/shared'
import { cloneProjectMeta } from './cloneFunctions'
import { createActionHashMapAndImportProjectData } from './createActionHashMapAndImportProjectData'
import { AppClient } from '@holochain/client'

export async function internalImportProject(
  appWebsocket: AppClient,
  cellIdString: CellIdString,
  agentAddress: AgentPubKeyB64,
  projectData: BackwardsCompatibleProjectExport,
  passphrase: string,
  dispatch: any,
  iCreateActionHashMapAndImportProjectData: typeof createActionHashMapAndImportProjectData,
  iFinalizeCreateProject: typeof finalizeCreateProject,
  projectsZomeApi: ProjectsZomeApi
) {
  // next step is to import the bulk of the data into that project
  const oldToNewAddressMaps = await iCreateActionHashMapAndImportProjectData(
    appWebsocket,
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

export async function importProject(
  _appWebsocket: AppClient,
  cellIdString: CellIdString,
  agentAddress: AgentPubKeyB64,
  projectData: BackwardsCompatibleProjectExport,
  passphrase: string,
  dispatch: any
) {
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  return internalImportProject(
    appWebsocket,
    cellIdString,
    agentAddress,
    projectData,
    passphrase,
    dispatch,
    createActionHashMapAndImportProjectData,
    finalizeCreateProject,
    projectsZomeApi
  )
}
