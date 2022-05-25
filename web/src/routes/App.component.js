import React, { useState } from 'react'
import {
  Redirect,
  HashRouter as Router,
  Switch,
  Route,
} from 'react-router-dom'

import './App.scss'

// import components here
import Header from '../components/Header/Header'
import LoadingScreen from '../components/LoadingScreen/LoadingScreen'
import Footer from '../components/Footer/Footer'

// import new routes here
import CreateProfilePage from './CreateProfilePage/CreateProfilePage.connector'
import Dashboard from './Dashboard/Dashboard.connector'
import ProjectView from './ProjectView/ProjectView.connector'
// import RunUpdate from './RunUpdate/RunUpdate'

import IntroScreen from '../components/IntroScreen/IntroScreen'
import ErrorBoundaryScreen from '../components/ErrorScreen/ErrorScreen'
// all global modals in here
import GlobalModals from './GlobalModals'

export default function App({
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
  inviteMembersModalShowing,
  openInviteMembersModal,
  hideInviteMembersModal,
  goToOutcome
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
          {/* <Route
            path="/run-update"
            render={() => <RunUpdate preRestart version={updateAvailable} />}
          />
          <Route path="/finish-update" render={() => <RunUpdate />} /> */}
          <Route path="/" render={() => <Redirect to="/dashboard" />} />
        </Switch>
        {agentAddress && (
          <Header
            members={members}
            project={activeProjectMeta}
            presentMembers={presentMembers}
            {...{
              activeEntryPoints,
              projectId,
              whoami,
              updateStatus,
              openInviteMembersModal,
              setShowProjectSettingsOpen,
              setShowProfileEditForm,
              setShowPreferences,
              goToOutcome
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
            openInviteMembersModal,
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