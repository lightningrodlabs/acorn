import { connect } from 'react-redux'
import { getAdminWs, getAppWs } from '../../hcWebsockets'
import { fetchEntryPointDetails } from '../../redux/persistent/projects/entry-points/actions'
import { fetchMembers } from '../../redux/persistent/projects/members/actions'
import {
  fetchProjectMeta,
  updateProjectMeta,
} from '../../redux/persistent/projects/project-meta/actions'
import { setActiveProject } from '../../redux/ephemeral/active-project/actions'
import { openInviteMembersModal } from '../../redux/ephemeral/invite-members-modal/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { cellIdFromString } from '../../utils'
import { ActionHashB64, AgentPubKeyB64, CellIdString } from '../../types/shared'
import { RootState } from '../../redux/reducer'
import { createSelectProjectAggregated } from '../../redux/persistent/projects/select'
import Dashboard, {
  DashboardDispatchProps,
  DashboardStateProps,
} from './Dashboard.component'
import { LayeringAlgorithm, ProjectMeta } from '../../types'
import { importProject } from '../../migrating/import/importProject'
import { uninstallProject } from '../../projects/uninstallProject'
import { createProject } from '../../projects/createProject'
import { joinProject, triggerJoinSignal } from '../../projects/joinProject'

function mapStateToProps(state: RootState): DashboardStateProps {
  // projects where at least the projectMeta is loaded
  const projects = Object.keys(state.projects.projectMeta).map(
    createSelectProjectAggregated(state)
  )
  return {
    agentAddress: state.agentAddress,
    // includes projects whose projectMeta is not loaded
    projectCellIdStrings: state.cells.projects,
    projects,
  }
}

function mapDispatchToProps(dispatch: any): DashboardDispatchProps {
  return {
    setActiveProject: (projectId: CellIdString) => {
      return dispatch(setActiveProject(projectId))
    },
    setShowInviteMembersModal: (passphrase: string) => {
      return dispatch(openInviteMembersModal(passphrase))
    },
    uninstallProject: async (appId: string, cellId: CellIdString) => {
      const adminWs = await getAdminWs()
      return uninstallProject(appId, cellId, dispatch, adminWs)
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
        layeringAlgorithm: LayeringAlgorithm.Classic,
        topPriorityOutcomes: [],
        isMigrated: null,
      }
      await createProject(
        passphrase,
        projectMeta,
        agentAddress,
        dispatch,
        projectsZomeApi
      )
    },
    joinProject: async (passphrase: string) => {
      const appWs = await getAppWs()
      const cellIdString = await joinProject(passphrase, dispatch)
      const cellId = cellIdFromString(cellIdString)
      triggerJoinSignal(cellId, appWs)
      return cellIdString
    },
    importProject: (cellIdString, agentAddress, projectData, passphrase) => {
      return importProject(
        cellIdString,
        agentAddress,
        projectData,
        passphrase,
        dispatch
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
