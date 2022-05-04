import { connect } from 'react-redux'
import { updateWhoami } from '../redux/persistent/profiles/who-am-i/actions'
import {
  setHasAccessedGuidebook,
  setNavigationPreference,
} from '../redux/ephemeral/local-preferences/actions'
import selectEntryPoints, { selectActiveProjectMembers } from '../redux/persistent/projects/entry-points/select'
import { animatePanAndZoom } from '../redux/ephemeral/viewport/actions'
import { closeInviteMembersModal, openInviteMembersModal } from '../redux/ephemeral/invite-members-modal/actions'
import ProfilesZomeApi from '../api/profilesApi'
import { getAppWs } from '../hcWebsockets'
import { cellIdFromString } from '../utils'
import { RootState } from '../redux/reducer'
import App from './App.component'

function mapStateToProps(state: RootState) {
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
  const activeProjectMeta = state.projects.projectMeta[activeProject] || {}

  // select the list of folks ("Agents in holochain") who are members
  // of the active project, if there is one
  const members = activeProject
    ? selectActiveProjectMembers(state, activeProject)
    : []
  
  function getDnaHashFromProjectId(activeProject) {
    return activeProject ? activeProject.split("[:cell_id_divider:]")[0] : activeProject
  }
  const presentMembers = Object.values(state.ui.realtimeInfo)
    .filter((agentInfo) => getDnaHashFromProjectId(agentInfo.projectId) === getDnaHashFromProjectId(activeProject))
    .map((agentInfo) => agentInfo.agentPubKey).filter((agentPubKey) => members.find((member) => member.agentPubKey === agentPubKey))

  const allProjectEntryPoints = activeProject
    ? selectEntryPoints(state, activeProject)
    : []
  const activeEntryPointsObjects = activeEntryPoints
    .map((headerHash) => {
      return allProjectEntryPoints.find(
        (entryPoint) => entryPoint.headerHash === headerHash
      )
    })
    // cut out invalid ones
    .filter((e) => e)

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
    members: members,
    presentMembers: presentMembers,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    setNavigationPreference: (preference) => {
      return dispatch(setNavigationPreference(preference))
    },
    hideGuidebookHelpMessage: () => {
      const hideAction = setHasAccessedGuidebook(true)
      return dispatch(hideAction)
    },
    goToOutcome: (outcomeHeaderHash) => {
      return dispatch(animatePanAndZoom(outcomeHeaderHash))
    },
    openInviteMembersModal: (passphrase) => {
      return dispatch(openInviteMembersModal(passphrase))
    },
    hideInviteMembersModal: () => {
      return dispatch(closeInviteMembersModal())
    }
  }
}

function mergeProps(stateProps, dispatchProps, _ownProps) {
  const { profilesCellIdString } = stateProps
  let cellId
  if (profilesCellIdString) {
    cellId = cellIdFromString(profilesCellIdString)
  }
  const { dispatch } = dispatchProps
  return {
    ...stateProps,
    ...dispatchProps,
    updateWhoami: async (entry, headerHash) => {
      const appWebsocket = await getAppWs()
      const profilesZomeApi = new ProfilesZomeApi(appWebsocket)
      const updatedWhoami = await profilesZomeApi.profile.updateWhoami(cellId, { entry, headerHash })
      return dispatch(
        updateWhoami(profilesCellIdString, updatedWhoami)
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(App)
