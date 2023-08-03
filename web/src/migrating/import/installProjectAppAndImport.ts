import ProjectsZomeApi from '../../api/projectsApi'
import { installProjectApp } from '../../projects/installProjectApp'
import { setMember } from '../../redux/persistent/projects/members/actions'
import { simpleCreateProjectMeta } from '../../redux/persistent/projects/project-meta/actions'
import { LayeringAlgorithm, ProjectMeta } from '../../types/projectMeta'
import { AgentPubKeyB64 } from '../../types/shared'
import { cellIdFromString } from '../../utils'
import { ProjectExportDataV1 } from '../export'
import { createActionHashMapAndImportProjectData } from './createActionHashMapAndImportProjectData'

export async function internalInstallProjectAppAndImport(
  agentAddress: AgentPubKeyB64,
  projectData: ProjectExportDataV1,
  passphrase: string,
  dispatch: any,
  _installProjectApp: typeof installProjectApp,
  _importProjectData: typeof createActionHashMapAndImportProjectData,
  projectsZomeApi: ProjectsZomeApi
) {
  // first step is to install the dna
  const [projectsCellIdString] = await _installProjectApp(passphrase)
  const cellId = cellIdFromString(projectsCellIdString)
  // next step is to import the rest of the data into that project
  const oldToNewAddressMap = await _importProjectData(
    projectData,
    projectsCellIdString,
    dispatch
  )

  // only add the project meta after the rest has been imported
  // so it doesn't list itself early in the process
  // first step is to create new project
  const originalTopPriorityOutcomes =
    projectData.projectMeta.topPriorityOutcomes
  const projectMeta: ProjectMeta = {
    ...projectData.projectMeta,
    // the question mark operator for backwards compatibility
    topPriorityOutcomes: originalTopPriorityOutcomes
      ? originalTopPriorityOutcomes
          .map((oldAddress) => oldToNewAddressMap[oldAddress])
          .filter((address) => address)
      : [],
    // add a fallback layering algorithm in case the project has none
    layeringAlgorithm: projectData.projectMeta.layeringAlgorithm
      ? projectData.projectMeta.layeringAlgorithm
      : LayeringAlgorithm.LongestPath,
    createdAt: Date.now(),
    creatorAgentPubKey: agentAddress,
    passphrase: passphrase,
    isMigrated: null,
  }
  // v0.5.4-alpha
  // not an actual field in the backend
  // needed to type-convert to any so typescript doesn't complain
  delete (projectMeta as any).actionHash

  dispatch(setMember(projectsCellIdString, { agentPubKey: agentAddress }))

  const simpleCreatedProjectMeta = await projectsZomeApi.projectMeta.simpleCreateProjectMeta(
    cellId,
    projectMeta
  )

  dispatch(
    simpleCreateProjectMeta(projectsCellIdString, simpleCreatedProjectMeta)
  )
}

export async function installProjectAppAndImport(
  agentAddress: AgentPubKeyB64,
  projectData: ProjectExportDataV1,
  passphrase: string,
  dispatch: any,
  projectsZomeApi: ProjectsZomeApi
) {
  internalInstallProjectAppAndImport(
    agentAddress,
    projectData,
    passphrase,
    dispatch,
    installProjectApp,
    createActionHashMapAndImportProjectData,
    projectsZomeApi
  )
}
