import React, { useState } from 'react'
import {
  Redirect,
  HashRouter as Router,
  Switch,
  Route,
} from 'react-router-dom'
import { connect } from 'react-redux'

import './App.css'

import { updateWhoami } from '../who-am-i/actions'
import {
  setHasAccessedGuidebook,
  setNavigationPreference,
} from '../local-preferences/actions'

// import components here
import Header from '../components/Header/Header'
import LoadingScreen from '../components/LoadingScreen/LoadingScreen'
import Footer from '../components/Footer/Footer'

// import new routes here
import CreateProfilePage from './CreateProfilePage/CreateProfilePage'
import Dashboard from './Dashboard/Dashboard'
import ProjectView from './ProjectView/ProjectView'
import RunUpdate from './RunUpdate/RunUpdate'

import IntroScreen from '../components/IntroScreen/IntroScreen'
import selectEntryPoints, { selectActiveProjectMembers } from '../projects/entry-points/select'
import ErrorBoundaryScreen from '../components/ErrorScreen/ErrorScreen'
// all global modals in here
import GlobalModals from './GlobalModals'
import { animatePanAndZoom } from '../viewport/actions'
import { closeInviteMembersModal } from '../invite-members-modal/actions'

function App({
  members,
  presentMembers,
  activeEntryPoints,
  activeProjectMeta,
  projectId,
  agentAddress,
  whoami, // .entry and .headerHash
  hasFetchedForWhoami,
  updateWhoami,
  navigationPreference,
  setNavigationPreference,
  hideGuidebookHelpMessage,
  inviteMembersModalShowing,
  hideInviteMembersModal,
  goToGoal
}) {
  const [showProjectSettingsModal, setShowProjectSettingsOpen] = useState(false)
  const [showProfileEditForm, setShowProfileEditForm] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

  const onProfileSubmit = async (profile) => {
    await updateWhoami(profile, whoami.headerHash)
    setShowProfileEditForm(false)
  }
  const updateStatus = async (statusString) => {
    await updateWhoami(
      {
        ...whoami.entry,
        status: statusString,
      },
      whoami.headerHash
    )
  }

  return (
    <ErrorBoundaryScreen>
      <Router>
        <Switch>
          {/* Add new routes in here */}
          <Route path="/intro" component={IntroScreen} />
          <Route path="/register" component={CreateProfilePage} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/project/:projectId" component={ProjectView} />
          <Route
            path="/run-update"
            render={() => <RunUpdate preRestart version={updateAvailable} />}
          />
          <Route path="/finish-update" render={() => <RunUpdate />} />
          <Route path="/" render={() => <Redirect to="/dashboard" />} />
        </Switch>
        {agentAddress && (
          <Header
            members={members}
            project={activeProjectMeta}
            presentMembers={presentMembers}
            {...{
              hideGuidebookHelpMessage,
              activeEntryPoints,
              projectId,
              whoami,
              updateStatus,
              setShowProjectSettingsOpen,
              setShowProfileEditForm,
              setShowPreferences,
              goToGoal
            }}
          />
        )}
        <GlobalModals
          {...{
            whoami,
            activeProjectMeta,
            projectId,
            agentAddress,
            navigationPreference,
            setNavigationPreference,
            showProfileEditForm,
            setShowProfileEditForm,
            showPreferences,
            setShowPreferences,
            showProjectSettingsModal,
            setShowProjectSettingsOpen,
            inviteMembersModalShowing,
            hideInviteMembersModal,
            onProfileSubmit,
          }}
        />
        {/* Loading Screen if no user agent */}
        {!agentAddress && <LoadingScreen />}
        {agentAddress && hasFetchedForWhoami && !whoami && (
          <Redirect to="/intro" />
        )}
        {agentAddress && whoami && <Footer />}
      </Router>
    </ErrorBoundaryScreen>
  )
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
    goToGoal: (goalHeaderHash) => {
      return dispatch(animatePanAndZoom(goalHeaderHash))
    },
    hideInviteMembersModal: () => {
      return dispatch(closeInviteMembersModal())
    }
  }
}

function mapStateToProps(state) {
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
  
  const dnaId = activeProject ? activeProject.split("[:cell_id_divider:]")[0] : activeProject
  const presentMembers = Object.values(state.ui.realtimeInfo)
    .filter((agentInfo) => agentInfo.projectId.split("[:cell_id_divider:]")[0] === dnaId)
    .map((agentInfo) => agentInfo.agentPubKey).filter((agentPubKey) => members.find((member) => member.address === agentPubKey))

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

function mergeProps(stateProps, dispatchProps, _ownProps) {
  const { profilesCellIdString } = stateProps
  const { dispatch } = dispatchProps
  return {
    ...stateProps,
    ...dispatchProps,
    updateWhoami: (entry, headerHash) => {
      return dispatch(
        updateWhoami.create({
          payload: { entry, headerHash },
          cellIdString: profilesCellIdString,
        })
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(App)
