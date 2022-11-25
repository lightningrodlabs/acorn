import React, { useState } from 'react'
import { Redirect, HashRouter as Router, Switch, Route } from 'react-router-dom'

import { WireRecord } from '../api/hdkCrud'
import {
  ActionHashB64,
  AgentPubKeyB64,
  CellIdString,
  WithActionHash,
} from '../types/shared'
import { ProjectMeta, Profile, EntryPoint, Outcome } from '../types'

import './App.scss'

// import components here
import Header from '../components/Header/Header'
import LoadingScreen from '../components/LoadingScreen/LoadingScreen'
import Footer from '../components/Footer/Footer'

// import new routes here
import CreateProfilePage from './CreateProfilePage/CreateProfilePage.connector'
import Dashboard from './Dashboard/Dashboard.connector'
import ProjectView from './ProjectView/ProjectView.connector'
// import ProjectView from './ProjectView/ProjectView.component'
// import RunUpdate from './RunUpdate/RunUpdate'

import IntroScreen from '../components/IntroScreen/IntroScreen.connector'
import ErrorBoundaryScreen from '../components/ErrorScreen/ErrorScreen'
// all global modals in here
import GlobalModals from './GlobalModals'
import { WeServices } from '@lightningrodlabs/we-applet'

export type AppStateProps = {
  profilesCellIdString: string
  members: Profile[]
  presentMembers: AgentPubKeyB64[]
  activeEntryPoints: {
    entryPoint: WithActionHash<EntryPoint>
    outcome: WithActionHash<Outcome>
  }[]
  activeProjectMeta: WithActionHash<ProjectMeta>
  projectId: CellIdString
  agentAddress: AgentPubKeyB64
  whoami: WireRecord<Profile>
  hasFetchedForWhoami: boolean
  navigationPreference: 'mouse' | 'trackpad'
  inviteMembersModalShowing: null | string // will be the passphrase if defined
}
export type AppOwnProps = {
  appletProjectId: string,
  weServices: WeServices
}
export type AppDispatchProps = {
  dispatch: any
  setNavigationPreference: (preference: 'mouse' | 'trackpad') => void
  hideInviteMembersModal: () => void
  openInviteMembersModal: (passphrase: string) => void
  goToOutcome: (outcomeActionHash: ActionHashB64) => void
}

export type AppMergeProps = {
  updateWhoami: (entry: Profile, actionHash: ActionHashB64) => Promise<void>
}

export type AppProps = AppStateProps & AppDispatchProps & AppMergeProps & AppOwnProps

const App: React.FC<AppProps> = ({
  members,
  presentMembers,
  activeEntryPoints,
  activeProjectMeta,
  projectId,
  agentAddress,
  whoami,
  hasFetchedForWhoami,
  updateWhoami,
  navigationPreference,
  setNavigationPreference,
  inviteMembersModalShowing,
  openInviteMembersModal,
  hideInviteMembersModal,
  goToOutcome,
  appletProjectId,
  weServices,
}) => {
  const [showProjectSettingsModal, setShowProjectSettingsOpen] = useState(false)
  const [showProfileEditForm, setShowProfileEditForm] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const projectRouteString = `/project/${appletProjectId}/map`
  const onProfileSubmit = async (profile: Profile) => {
    await updateWhoami(profile, whoami.actionHash)
    setShowProfileEditForm(false)
  }
  const updateStatus = async (statusString: Profile['status']) => {
    await updateWhoami(
      {
        ...whoami.entry,
        status: statusString,
      },
      whoami.actionHash
    )
  }
  console.log('root level log')
  return (
    <ErrorBoundaryScreen>
      <Router>
        <Switch>
          {/* Add new routes in here */}
          <Route path="/project/:projectId" component={ProjectView} />
          {/* <Route
            path="/run-update"
            render={() => <RunUpdate preRestart version={updateAvailable} />}
          />
          <Route path="/finish-update" render={() => <RunUpdate />} /> */}
          <Route path="/" render={() => <Redirect to={projectRouteString} />} />
        </Switch>
        <Header
          project={activeProjectMeta}
          {...{
            members,
            presentMembers,
            activeEntryPoints,
            projectId,
            whoami,
            updateStatus,
            openInviteMembersModal,
            setShowProjectSettingsOpen,
            setShowProfileEditForm,
            setShowPreferences,
            goToOutcome,
          }}
        />
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
        {agentAddress && whoami && <Footer />}
      </Router>
    </ErrorBoundaryScreen>
  )
}

export default App
