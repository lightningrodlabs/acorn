import React, { useEffect, useState } from 'react'
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
import RunUpdate from './RunUpdate/RunUpdate'

import IntroScreen from '../components/IntroScreen/IntroScreen.connector'
import ErrorBoundaryScreen from '../components/ErrorScreen/ErrorScreen'
// all global modals in here
import GlobalModals from './GlobalModals'
import useVersionChecker from '../hooks/useVersionChecker'
import useMigrationChecker from '../hooks/useMigrationChecker'

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

export type AppProps = AppStateProps & AppDispatchProps & AppMergeProps

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
}) => {
  const [showProjectSettingsModal, setShowProjectSettingsOpen] = useState(false)
  const [showProfileEditForm, setShowProfileEditForm] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showUpdateBar, setShowUpdateBar] = useState(false)
  const updateVersionInfo = useVersionChecker()
  const migrationChecker = useMigrationChecker()

  useEffect(() => {
    if (updateVersionInfo) {
      setShowUpdateModal(true)
    }
  }, [JSON.stringify(updateVersionInfo)])

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

  const onCloseUpdateModal = () => {
    setShowUpdateModal(false)
    setShowUpdateBar(true)
  }

  const redirToIntro =
    agentAddress &&
    hasFetchedForWhoami &&
    !whoami &&
    migrationChecker.hasChecked &&
    !migrationChecker.dataForNeedsMigration

  const redirToFinishMigration =
    agentAddress &&
    migrationChecker.hasChecked &&
    migrationChecker.dataForNeedsMigration

  return (
    <div className={`screen-wrapper`}>
      <ErrorBoundaryScreen>
        <Router>
          {agentAddress && (
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
                setShowUpdateModal,
                showUpdateBar,
                setShowUpdateBar,
              }}
            />
          )}
          <Switch>
            {/* Add new routes in here */}
            <Route path="/intro" component={IntroScreen} />
            <Route path="/register" component={CreateProfilePage} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/project/:projectId" component={ProjectView} />
            <Route path="/run-update" render={() => <RunUpdate preRestart />} />
            <Route
              path="/finish-update"
              render={() => (
                <RunUpdate
                  migrationData={migrationChecker.dataForNeedsMigration}
                />
              )}
            />
            <Route path="/" render={() => <Redirect to="/dashboard" />} />
          </Switch>

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
              showUpdateBar,
              showUpdateModal,
              onCloseUpdateModal,
              updateVersionInfo,
            }}
          />
          {/* Loading Screen if no user agent, and also during checking whether migration is necessary */}
          {(!agentAddress || !migrationChecker.hasChecked) && <LoadingScreen />}
          {redirToIntro && <Redirect to="/intro" />}
          {redirToFinishMigration && <Redirect to="/finish-update" />}
          {agentAddress && whoami && <Footer />}
        </Router>
      </ErrorBoundaryScreen>
    </div>
  )
}

export default App
