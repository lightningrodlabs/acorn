import React, { useEffect, useState } from 'react'
import { Redirect, HashRouter as Router, Switch, Route } from 'react-router-dom'

import { WireRecord } from '../api/hdkCrud'
import {
  ActionHashB64,
  AgentPubKeyB64,
  CellIdString,
  WithActionHash,
} from '../types/shared'
import {
  ProjectMeta,
  Profile,
  EntryPoint,
  Outcome,
  LayeringAlgorithm,
} from '../types'

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
// hooks
import useVersionChecker from '../hooks/useVersionChecker'
import useFinishMigrationChecker from '../hooks/useFinishMigrationChecker'
import useFileDownloaded from '../hooks/useFileDownloaded'
import UpdateModalContext from '../context/UpdateModalContext'
import { ViewingReleaseNotes } from '../components/UpdateModal/UpdateModal'

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
  hasMigratedSharedProject: boolean
  hiddenAchievedOutcomes: CellIdString[]
  hiddenSmallOutcomes: CellIdString[]
  selectedLayeringAlgo: string
}

export type AppDispatchProps = {
  dispatch: any
  setNavigationPreference: (preference: 'mouse' | 'trackpad') => void
  hideInviteMembersModal: () => void
  openInviteMembersModal: (passphrase: string) => void
  goToOutcome: (outcomeActionHash: ActionHashB64) => void
  showSmallOutcomes: (projectCellId: CellIdString) => void
  hideSmallOutcomes: (projectCellId: CellIdString) => void
  showAchievedOutcomes: (projectCellId: CellIdString) => void
  hideAchievedOutcomes: (projectCellId: CellIdString) => void
}

export type AppMergeProps = {
  updateWhoami: (entry: Profile, actionHash: ActionHashB64) => Promise<void>
  setSelectedLayeringAlgo: (
    layeringAlgorithm: LayeringAlgorithm
  ) => Promise<void>
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
  hasMigratedSharedProject,
  hiddenAchievedOutcomes,
  hiddenSmallOutcomes,
  showSmallOutcomes,
  hideSmallOutcomes,
  showAchievedOutcomes,
  hideAchievedOutcomes,
  selectedLayeringAlgo,
  setSelectedLayeringAlgo,
}) => {
  const [exportedProjectName, setExportedProjectName] = useState('')
  const [showExportedModal, setShowExportedModal] = useState(false)
  const [showProjectSettingsModal, setShowProjectSettingsOpen] = useState(false)
  const [showProfileEditForm, setShowProfileEditForm] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showUpdateBar, setShowUpdateBar] = useState(false)
  const [viewingReleaseNotes, setViewingReleaseNotes] = useState(
    ViewingReleaseNotes.MainMessage
  )
  // custom hooks
  const updateVersionInfo = useVersionChecker()
  const finishMigrationChecker = useFinishMigrationChecker()
  const { fileDownloaded, setFileDownloaded } = useFileDownloaded()

  useEffect(() => {
    if (fileDownloaded) {
      setFileDownloaded(false)
      setShowExportedModal(true)
    }
  }, [fileDownloaded, setFileDownloaded])

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
    finishMigrationChecker.hasChecked &&
    !finishMigrationChecker.dataForNeedsMigration

  const redirToFinishMigration =
    agentAddress &&
    finishMigrationChecker.hasChecked &&
    finishMigrationChecker.dataForNeedsMigration

  return (
    <div className={`screen-wrapper`}>
      <ErrorBoundaryScreen>
        <UpdateModalContext.Provider
          value={{ showUpdateModal, setShowUpdateModal }}
        >
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
                  setExportedProjectName,
                  showExportedModal,
                  hasMigratedSharedProject,
                  setViewingReleaseNotes,
                }}
              />
            )}
            <Switch>
              {/* Add new routes in here */}
              <Route path="/intro" component={IntroScreen} />
              <Route path="/register" component={CreateProfilePage} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/project/:projectId" component={ProjectView} />
              <Route
                path="/run-update"
                render={() => (
                  <RunUpdate preRestart updateVersionInfo={updateVersionInfo} />
                )}
              />
              <Route
                path="/finish-update"
                render={() => (
                  <RunUpdate
                    migrationData={finishMigrationChecker.dataForNeedsMigration}
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
                exportedProjectName,
                showExportedModal,
                setShowExportedModal,
                hasMigratedSharedProject,
                viewingReleaseNotes,
                setViewingReleaseNotes,
              }}
            />
            {/* Loading Screen if no user agent, and also during checking whether migration is necessary */}
            {!(agentAddress && finishMigrationChecker.hasChecked) && (
              <LoadingScreen />
            )}
            {redirToIntro && <Redirect to="/intro" />}
            {redirToFinishMigration && <Redirect to="/finish-update" />}
            {agentAddress && whoami && (
              <Footer
                hiddenAchievedOutcomes={hiddenAchievedOutcomes}
                hiddenSmallOutcomes={hiddenSmallOutcomes}
                showSmallOutcomes={showSmallOutcomes}
                hideSmallOutcomes={hideSmallOutcomes}
                showAchievedOutcomes={showAchievedOutcomes}
                hideAchievedOutcomes={hideAchievedOutcomes}
                selectedLayeringAlgo={selectedLayeringAlgo}
                setSelectedLayeringAlgo={setSelectedLayeringAlgo}
              />
            )}
          </Router>
        </UpdateModalContext.Provider>
      </ErrorBoundaryScreen>
    </div>
  )
}

export default App
