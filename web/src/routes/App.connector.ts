import { connect } from 'react-redux'

import { ActionHashB64, CellIdString } from '../types/shared'
import { LayeringAlgorithm, Profile, ProjectMeta } from '../types'

import {
  setKeyboardNavigationPreference,
  setNavigationPreference,
} from '../redux/ephemeral/local-preferences/actions'
import selectEntryPoints from '../redux/persistent/projects/entry-points/select'
import { animatePanAndZoom } from '../redux/ephemeral/viewport/actions'
import ProfilesZomeApi from '../api/profilesApi'
import { getAppWs } from '../hcWebsockets'
import { cellIdFromString } from '../utils'
import { RootState } from '../redux/reducer'
import App, {
  AppStateProps,
  AppDispatchProps,
  AppOwnProps,
  AppProps,
} from './App.component'
import {
  hideAchievedOutcomes,
  hideSmallOutcomes,
  showAchievedOutcomes,
  showSmallOutcomes,
} from '../redux/ephemeral/map-view-settings/actions'
import ProjectsZomeApi from '../api/projectsApi'
import { updateProjectMeta } from '../redux/persistent/projects/project-meta/actions'
import { uninstallProject } from '../projects/uninstallProject'
import { unselectAll } from '../redux/ephemeral/selection/actions'
import { isWeaveContext } from '@theweave/api'
import { selectProjectMemberPukeys, selectProjectMemberProfiles } from '../redux/persistent/projects/members/select'
import selectProjectMembersPresent from '../redux/persistent/projects/realtime-info-signal/select'

function mapStateToProps(state: RootState): AppStateProps {
  const {
    ui: {
      activeProject,
      activeEntryPoints,
      localPreferences: { navigation, keyboardNavigation },
    },
  } = state
  // defensive coding for loading phase
  const activeProjectMeta = state.projects.projectMeta[activeProject]

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

  const activeProjectProfiles = selectProjectMemberProfiles(state, activeProject);
  const activeProjectMembersPresent = selectProjectMembersPresent(state, activeProject);

  // has any project been migrated
  const hasMigratedSharedProject = !!Object.entries(
    state.projects.projectMeta
  ).find(([cellIdString, projectMeta]) => {
    const members = selectProjectMemberPukeys(state, cellIdString)
    return members.length > 1 && projectMeta.isMigrated
  })

  const selectedLayeringAlgo = activeProjectMeta
    ? activeProjectMeta.layeringAlgorithm
    : 'LongestPath'

  return {
    projectMetas: state.projects.projectMeta,
    projectMembers: state.projects.members,
    projects: state.cells.projects,
    activeProjectProfiles,
    activeProjectMembersPresent,
    activeEntryPoints: activeEntryPointsObjects,
    activeProjectMeta,
    projectId: activeProject,
    myLocalProfile: state.myLocalProfile,
    agentAddress: state.agentAddress,
    navigationPreference: navigation,
    keyboardNavigationPreference: keyboardNavigation,
    hasMigratedSharedProject,
    hiddenAchievedOutcomes: state.ui.mapViewSettings.hiddenAchievedOutcomes,
    hiddenSmallOutcomes: state.ui.mapViewSettings.hiddenSmallOutcomes,
    selectedLayeringAlgo,
  }
}

function mapDispatchToProps(dispatch: any): AppDispatchProps {
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
    unselectAll: () => {
      return dispatch(unselectAll())
    },
  }
}

function mergeProps(
  stateProps: AppStateProps,
  dispatchProps: AppDispatchProps,
  ownProps: AppOwnProps
): AppProps {
  const { projectId, myLocalProfile, projects } = stateProps
  const { dispatch } = dispatchProps
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    uninstallProject: async (cellIdString: CellIdString) => {
      const appWs = await getAppWs()
      uninstallProject(cellIdString, dispatch, appWs)
    },
    updateWhoamis: async (profile: Profile) => {
      if (!myLocalProfile) throw new Error("Cannot update whoamis: Local profile is undefined/null.")
      const appWebsocket = await getAppWs()
      await Promise.all(projects.map(async (cellId) => {
        const currentWhoami = stateProps.projectMembers[cellId].whoami;
        const profilesApi = new ProfilesZomeApi(appWebsocket, cellIdFromString(cellId));
        await profilesApi.profile.updateWhoami({ entry: profile, actionHash: currentWhoami.actionHash });
      }))
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
