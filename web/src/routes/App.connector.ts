import { connect } from 'react-redux'

import { ActionHashB64, CellIdString } from '../types/shared'
import { LayeringAlgorithm, Profile, ProjectMeta } from '../types'

import { updateWhoami } from '../redux/persistent/profiles/who-am-i/actions'
import {
  setKeyboardNavigationPreference,
  setNavigationPreference,
} from '../redux/ephemeral/local-preferences/actions'
import selectEntryPoints, {
  selectActiveProjectMembers,
} from '../redux/persistent/projects/entry-points/select'
import { animatePanAndZoom } from '../redux/ephemeral/viewport/actions'
import ProfilesZomeApi from '../api/profilesApi'
import { getAdminWs, getAppWs } from '../hcWebsockets'
import { cellIdFromString } from '../utils'
import { RootState } from '../redux/reducer'
import App, { AppProps, AppStateProps, AppDispatchProps } from './App.component'
import selectProjectMembersPresent from '../redux/persistent/projects/realtime-info-signal/select'
import {
  hideAchievedOutcomes,
  hideSmallOutcomes,
  showAchievedOutcomes,
  showSmallOutcomes,
} from '../redux/ephemeral/map-view-settings/actions'
import ProjectsZomeApi from '../api/projectsApi'
import { updateProjectMeta } from '../redux/persistent/projects/project-meta/actions'
import { uninstallProject } from '../projects/uninstallProject'

function mapStateToProps(state: RootState): AppStateProps {
  const {
    ui: {
      hasFetchedForWhoami,
      activeProject,
      activeEntryPoints,
      localPreferences: { navigation, keyboardNavigation },
    },
    cells: { profiles: profilesCellIdString },
  } = state
  // defensive coding for loading phase
  const activeProjectMeta = state.projects.projectMeta[activeProject]

  // select the list of folks ("Agents in holochain") who are members
  // of the active project, if there is one
  const members = activeProject
    ? selectActiveProjectMembers(state, activeProject)
    : []

  const presentMembers = activeProject
    ? selectProjectMembersPresent(state, activeProject)
    : []

  const allProjectEntryPoints = activeProject
    ? selectEntryPoints(state, activeProject)
    : []
  const activeEntryPointsObjects = activeEntryPoints
    .map((actionHash: ActionHashB64) => {
      return allProjectEntryPoints.find(
        (entryPoint) => entryPoint.entryPoint.actionHash === actionHash
      )
    })
    // cut out invalid ones
    .filter((e) => e)

  // has any project been migrated
  const hasMigratedSharedProject = !!Object.entries(
    state.projects.projectMeta
  ).find(([cellIdString, projectMeta]) => {
    const members = selectActiveProjectMembers(state, cellIdString)
    return members.length > 1 && projectMeta.isMigrated
  })

  const selectedLayeringAlgo = activeProjectMeta
    ? activeProjectMeta.layeringAlgorithm
    : 'LongestPath'

  return {
    profilesCellIdString,
    activeEntryPoints: activeEntryPointsObjects,
    projectMetas: state.projects.projectMeta,
    projectMembers: state.projects.members,
    projectId: activeProject,
    activeProjectMeta,
    whoami: state.whoami,
    hasFetchedForWhoami,
    agentAddress: state.agentAddress,
    navigationPreference: navigation,
    keyboardNavigationPreference: keyboardNavigation,
    members,
    presentMembers,
    hasMigratedSharedProject,
    hiddenAchievedOutcomes: state.ui.mapViewSettings.hiddenAchievedOutcomes,
    hiddenSmallOutcomes: state.ui.mapViewSettings.hiddenSmallOutcomes,
    selectedLayeringAlgo,
  }
}

function mapDispatchToProps(dispatch): AppDispatchProps {
  return {
    dispatch,
    setNavigationPreference: (preference) => {
      return dispatch(setNavigationPreference(preference))
    },
    setKeyboardNavigationPreference: (preference) => {
      return dispatch(setKeyboardNavigationPreference(preference))
    },
    goToOutcome: (outcomeActionHash) => {
      return dispatch(animatePanAndZoom(outcomeActionHash, true))
    },
    showSmallOutcomes: (projectCellId) => {
      return dispatch(showSmallOutcomes(projectCellId))
    },
    hideSmallOutcomes: (projectCellId) => {
      return dispatch(hideSmallOutcomes(projectCellId))
    },
    showAchievedOutcomes: (projectCellId) => {
      return dispatch(showAchievedOutcomes(projectCellId))
    },
    hideAchievedOutcomes: (projectCellId) => {
      return dispatch(hideAchievedOutcomes(projectCellId))
    },
  }
}

function mergeProps(
  stateProps: AppStateProps,
  dispatchProps: AppDispatchProps,
  _ownProps: {}
): AppProps {
  const { profilesCellIdString, projectId } = stateProps
  let cellId
  if (profilesCellIdString) {
    cellId = cellIdFromString(profilesCellIdString)
  }
  const { dispatch } = dispatchProps
  return {
    ...stateProps,
    ...dispatchProps,
    uninstallProject: async (appId: string, cellIdString: CellIdString) => {
      const adminWs = await getAdminWs()
      uninstallProject(appId, cellIdString, dispatch, adminWs)
    },
    updateWhoami: async (entry: Profile, actionHash: string) => {
      const appWebsocket = await getAppWs()
      const profilesZomeApi = new ProfilesZomeApi(appWebsocket)
      const updatedWhoami = await profilesZomeApi.profile.updateWhoami(cellId, {
        entry,
        actionHash,
      })
      return dispatch(updateWhoami(profilesCellIdString, updatedWhoami))
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
    setSelectedLayeringAlgo: async (layeringAlgorithm: LayeringAlgorithm) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)

      const entry = {
        ...stateProps.activeProjectMeta,
        layeringAlgorithm,
      }

      const actionHash = stateProps.activeProjectMeta.actionHash

      const updatedProjectMeta = await projectsZomeApi.projectMeta.update(
        cellIdFromString(projectId),
        {
          entry,
          actionHash,
        }
      )
      return dispatch(updateProjectMeta(projectId, updatedProjectMeta))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(App)
