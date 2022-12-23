import { connect } from 'react-redux'

import { ActionHashB64 } from '../types/shared'
import { Profile } from '../types'

import { updateWhoami } from '../redux/persistent/profiles/who-am-i/actions'
import { setNavigationPreference } from '../redux/ephemeral/local-preferences/actions'
import selectEntryPoints, {
  selectActiveProjectMembers,
} from '../redux/persistent/projects/entry-points/select'
import { animatePanAndZoom } from '../redux/ephemeral/viewport/actions'
import {
  closeInviteMembersModal,
  openInviteMembersModal,
} from '../redux/ephemeral/invite-members-modal/actions'
import ProfilesZomeApi from '../api/profilesApi'
import { getAppWs } from '../hcWebsockets'
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

function mapStateToProps(state: RootState): AppStateProps {
  const {
    ui: {
      hasFetchedForWhoami,
      activeProject,
      activeEntryPoints,
      inviteMembersModal,
      localPreferences: { navigation },
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
  const hasMigratedSharedProject = !!Object.values(
    state.projects.projectMeta
  ).find((projectMeta) => {
    return projectMeta.isMigrated
  })

  return {
    profilesCellIdString,
    activeEntryPoints: activeEntryPointsObjects,
    projectId: activeProject,
    activeProjectMeta,
    whoami: state.whoami,
    hasFetchedForWhoami,
    agentAddress: state.agentAddress,
    navigationPreference: navigation,
    inviteMembersModalShowing: inviteMembersModal.passphrase,
    members,
    presentMembers,
    hasMigratedSharedProject,
    hiddenAchievedOutcomes: state.ui.mapViewSettings.hiddenAchievedOutcomes,
    hiddenSmallOutcomes: state.ui.mapViewSettings.hiddenSmallOutcomes,
  }
}

function mapDispatchToProps(dispatch): AppDispatchProps {
  return {
    dispatch,
    setNavigationPreference: (preference) => {
      return dispatch(setNavigationPreference(preference))
    },
    goToOutcome: (outcomeActionHash) => {
      return dispatch(animatePanAndZoom(outcomeActionHash, true))
    },
    openInviteMembersModal: (passphrase) => {
      return dispatch(openInviteMembersModal(passphrase))
    },
    hideInviteMembersModal: () => {
      return dispatch(closeInviteMembersModal())
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
  const { profilesCellIdString } = stateProps
  let cellId
  if (profilesCellIdString) {
    cellId = cellIdFromString(profilesCellIdString)
  }
  const { dispatch } = dispatchProps
  return {
    ...stateProps,
    ...dispatchProps,
    updateWhoami: async (entry: Profile, actionHash: string) => {
      const appWebsocket = await getAppWs()
      const profilesZomeApi = new ProfilesZomeApi(appWebsocket)
      const updatedWhoami = await profilesZomeApi.profile.updateWhoami(cellId, {
        entry,
        actionHash,
      })
      return dispatch(updateWhoami(profilesCellIdString, updatedWhoami))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(App)
