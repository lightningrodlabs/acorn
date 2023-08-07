import { connect } from 'react-redux'

import { getAdminWs, getAppWs } from '../../hcWebsockets'
import { fetchEntryPointDetails } from '../../redux/persistent/projects/entry-points/actions'
import {
  fetchMembers,
} from '../../redux/persistent/projects/members/actions'
import {
  fetchProjectMeta,
  updateProjectMeta,
} from '../../redux/persistent/projects/project-meta/actions'
import selectEntryPoints from '../../redux/persistent/projects/entry-points/select'

import { setActiveProject } from '../../redux/ephemeral/active-project/actions'
import { installProjectAndImport } from '../../migrating/import/installProjectAndImport'
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
import { deactivateProject } from '../../projects/deactivateProject'
import { createProject } from '../../projects/createProject'
import { joinProject, triggerJoinSignal } from '../../projects/joinProject'

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
    deactivateProject: async (appId: string, cellId: CellIdString) => {
      const adminWs = await getAdminWs()
      return deactivateProject(appId, cellId, dispatch, adminWs)
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
    createProject: async (
      agentAddress: AgentPubKeyB64,
      project: { name: string; image: string },
      passphrase: string
    ) => {
      const appWs = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWs)
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
      await createProject(passphrase, projectMeta, agentAddress, dispatch, projectsZomeApi)
    },
    joinProject: async (passphrase: string) => {
      const appWs = await getAppWs()
      const cellIdString = await joinProject(passphrase, dispatch)
      const cellId = cellIdFromString(cellIdString)
      triggerJoinSignal(cellId, appWs)
      return cellIdString
    },
    installProjectAndImport: (agentAddress, projectData, passphrase) => {
      return installProjectAndImport(
        agentAddress,
        projectData,
        passphrase,
        dispatch
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
