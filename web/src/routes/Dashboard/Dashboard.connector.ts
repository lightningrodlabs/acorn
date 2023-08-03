import { connect } from 'react-redux'

import { PROJECTS_ZOME_NAME } from '../../holochainConfig'
import { getAdminWs, getAppWs, getAgentPubKey } from '../../hcWebsockets'
import { fetchEntryPointDetails } from '../../redux/persistent/projects/entry-points/actions'
import {
  fetchMembers,
  setMember,
} from '../../redux/persistent/projects/members/actions'
import {
  simpleCreateProjectMeta,
  fetchProjectMeta,
  updateProjectMeta,
} from '../../redux/persistent/projects/project-meta/actions'
import selectEntryPoints from '../../redux/persistent/projects/entry-points/select'

import { setActiveProject } from '../../redux/ephemeral/active-project/actions'
import {
  joinProjectCellId,
  removeProjectCellId,
} from '../../redux/persistent/cells/actions'
import { installProjectAppAndImport } from '../../migrating/import/import'
import { openInviteMembersModal } from '../../redux/ephemeral/invite-members-modal/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { cellIdFromString } from '../../utils'
import { ActionHashB64, AgentPubKeyB64, CellIdString } from '../../types/shared'
import { RootState } from '../../redux/reducer'
import Dashboard, {
  DashboardDispatchProps,
  DashboardStateProps,
} from './Dashboard.component'
import { LayeringAlgorithm, ProjectMeta } from '../../types'
import selectProjectMembersPresent from '../../redux/persistent/projects/realtime-info-signal/select'
import { installProjectApp } from '../../projects/installProjectApp'

async function createProject(
  passphrase: string,
  projectMeta: ProjectMeta,
  agentAddress: AgentPubKeyB64,
  dispatch: any
) {
  const [cellIdString] = await installProjectApp(passphrase)
  const cellId = cellIdFromString(cellIdString)
  // because we are acting optimistically,
  // we will directly set ourselves as a member of this cell
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  await dispatch(setMember(cellIdString, { agentPubKey: agentAddress }))
  const b1 = Date.now()
  const simpleCreatedProjectMeta = await projectsZomeApi.projectMeta.simpleCreateProjectMeta(
    cellId,
    projectMeta
  )
  await dispatch(
    simpleCreateProjectMeta(cellIdString, simpleCreatedProjectMeta)
  )
  const b2 = Date.now()
  console.log('duration in MS over createProjectMeta ', b2 - b1)
  return cellIdString
}

async function joinProject(passphrase: string, dispatch): Promise<boolean> {
  // joinProject
  // join a DNA
  // then try to find a peer
  // either way, just push the project into the 'queue'
  const [cellIdString, cellId, installedAppId] = await installProjectApp(
    passphrase
  )
  const appWs = await getAppWs()
  // trigger a side effect...
  // this will let other project members know you're here
  // without 'blocking' the thread or the UX
  appWs
    .callZome(
      {
        cap_secret: null,
        cell_id: cellId,
        zome_name: PROJECTS_ZOME_NAME,
        fn_name: 'init_signal',
        payload: null,
        provenance: getAgentPubKey(), // FIXME: this will need correcting after holochain changes this
      },
      50000
    )
    .then(() => console.log('succesfully triggered init_signal'))
    .catch((e) => console.error('failed while triggering init_signal: ', e))
  // this will trigger the fetching of project meta
  // checks and other things
  dispatch(joinProjectCellId(cellIdString))
  return false
}

async function deactivateApp(
  appId: string,
  cellId: CellIdString,
  dispatch: any
) {
  const adminWs = await getAdminWs()
  await adminWs.disableApp({
    installed_app_id: appId,
  })
  await dispatch(removeProjectCellId(cellId))
}

// ACTUAL REDUX FUNCTIONS

function mapStateToProps(state: RootState): DashboardStateProps {
  const projects = Object.keys(state.projects.projectMeta).map((cellId) => {
    const projectMeta = state.projects.projectMeta[cellId]
    const members = state.projects.members[cellId] || {}
    const memberProfiles = Object.keys(members).map(
      (agentAddress) => state.agents[agentAddress]
    )
    const entryPoints = selectEntryPoints(state, cellId)
    const presentMembers = selectProjectMembersPresent(state, cellId)
    return {
      projectMeta,
      cellId,
      presentMembers,
      members: memberProfiles,
      entryPoints,
    }
  })
  return {
    agentAddress: state.agentAddress,
    cells: state.cells.projects,
    projects,
  }
}

function mapDispatchToProps(dispatch): DashboardDispatchProps {
  return {
    setActiveProject: (projectId: CellIdString) => {
      return dispatch(setActiveProject(projectId))
    },
    setShowInviteMembersModal: (passphrase: string) => {
      return dispatch(openInviteMembersModal(passphrase))
    },
    deactivateApp: async (appId: string, cellId: CellIdString) => {
      return deactivateApp(appId, cellId, dispatch)
    },
    fetchEntryPointDetails: async (cellIdString: CellIdString) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const cellId = cellIdFromString(cellIdString)
      const entryPointDetails = await projectsZomeApi.entryPoint.fetchEntryPointDetails(
        cellId
      )
      return dispatch(fetchEntryPointDetails(cellIdString, entryPointDetails))
    },
    fetchMembers: async (cellIdString: CellIdString) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const cellId = cellIdFromString(cellIdString)
      const members = await projectsZomeApi.member.fetch(cellId)
      return dispatch(fetchMembers(cellIdString, members))
    },
    fetchProjectMeta: async (cellIdString: CellIdString) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const cellId = cellIdFromString(cellIdString)
      const projectMeta = await projectsZomeApi.projectMeta.fetchProjectMeta(
        cellId
      )
      return dispatch(fetchProjectMeta(cellIdString, projectMeta))
    },
    createProject: async (
      agentAddress: AgentPubKeyB64,
      project: { name: string; image: string },
      passphrase: string
    ) => {
      // matches the createProjectMeta fn and type signature
      const projectMeta: ProjectMeta = {
        ...project, // name and image
        passphrase,
        creatorAgentPubKey: agentAddress,
        createdAt: Date.now(),
        isImported: false,
        layeringAlgorithm: LayeringAlgorithm.CoffmanGraham,
        topPriorityOutcomes: [],
        isMigrated: null,
      }
      await createProject(passphrase, projectMeta, agentAddress, dispatch)
    },
    updateProjectMeta: async (
      projectMeta: ProjectMeta,
      actionHash: ActionHashB64,
      cellIdString: CellIdString
    ) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const cellId = cellIdFromString(cellIdString)
      const updatedProjectMeta = await projectsZomeApi.projectMeta.update(
        cellId,
        { entry: projectMeta, actionHash }
      )
      return dispatch(updateProjectMeta(cellIdString, updatedProjectMeta))
    },
    joinProject: (passphrase: string) => {
      return joinProject(passphrase, dispatch)
    },
    importProject: (agentAddress, projectData, passphrase) => {
      return installProjectAppAndImport(
        agentAddress,
        projectData,
        passphrase,
        dispatch
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
