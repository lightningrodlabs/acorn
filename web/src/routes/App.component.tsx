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
import { ViewingReleaseNotes } from '../components/UpdateModal/UpdateModal'
import NetworkInfo from '../components/NetworkInfo/NetworkInfo'

// import new routes here
import CreateProfilePage from './CreateProfilePage/CreateProfilePage.connector'
import Dashboard from './Dashboard/Dashboard.connector'
import ProjectView from './ProjectView/ProjectView.connector'
import VersionUpdateLeaving from './VersionUpdateLeaving/VersionUpdateLeaving'
import VersionUpdateEntering from './VersionUpdateEntering/VersionUpdateEntering'
import IntroScreen from '../components/IntroScreen/IntroScreen.connector'
import ErrorBoundaryScreen from '../components/ErrorScreen/ErrorScreen'

// all global modals in here
import GlobalModals from './GlobalModals'

// hooks
import useVersionChecker from '../hooks/useVersionChecker'
import useFinishMigrationChecker from '../hooks/useFinishMigrationChecker'
import useFileDownloaded from '../hooks/useFileDownloaded'

// react context
import ModalContexts, { ModalState, OpenModal } from '../context/ModalContexts'

// redux
import {
  COORDINATES,
  KeyboardNavigationPreference,
  MODAL,
  NavigationPreference,
} from '../redux/ephemeral/local-preferences/reducer.js'
import { ProjectMetaState } from '../redux/persistent/projects/project-meta/reducer'
import { MembersState } from '../redux/persistent/projects/members/reducer'

export type AppStateProps = {
  projectMetas: ProjectMetaState
  projectMembers: MembersState
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
  navigationPreference: NavigationPreference
  keyboardNavigationPreference: KeyboardNavigationPreference
  hasMigratedSharedProject: boolean
  hiddenAchievedOutcomes: CellIdString[]
  hiddenSmallOutcomes: CellIdString[]
  selectedLayeringAlgo: string
}

export type AppDispatchProps = {
  dispatch: any
  setNavigationPreference: (preference: NavigationPreference) => void
  setKeyboardNavigationPreference: (
    preference: typeof COORDINATES | typeof MODAL
  ) => void
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
  projectMetas,
  projectMembers,
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
  keyboardNavigationPreference,
  setKeyboardNavigationPreference,
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
  const [networkInfoOpen, setNetworkInfoOpen] = useState(false)

  const [modalState, setModalState] = useState<ModalState>({
    id: OpenModal.None
  })

  // TODO: can move into ModalState and eliminate
  // could be refactored into ModalState context
  const [showProfileEditForm, setShowProfileEditForm] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [viewingReleaseNotes, setViewingReleaseNotes] = useState(
    ViewingReleaseNotes.MainMessage
  )
  //

  const [showUpdateBar, setShowUpdateBar] = useState(false)
  // custom hooks
  const updateVersionInfo = useVersionChecker()
  // to do development testing of migration-feature
  // uncomment the following line (and comment the one above)
  // const updateVersionInfo = useVersionChecker(true)
  const finishMigrationChecker = useFinishMigrationChecker()
  const { fileDownloaded, setFileDownloaded } = useFileDownloaded()

  useEffect(() => {
    if (fileDownloaded) {
      setFileDownloaded(false)
    }
  }, [fileDownloaded, setFileDownloaded])

  // show the update bar if there's a new release
  useEffect(() => {
    if (updateVersionInfo.newReleaseVersion) {
      setShowUpdateBar(true)
    }
  }, [updateVersionInfo.newReleaseVersion])

  useEffect(() => {
    // add event listener for pressing the 'i' key with the ctrl key
    // to open the network info modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'i') {
        setNetworkInfoOpen(!networkInfoOpen)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [networkInfoOpen, setNetworkInfoOpen])

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

  const projectSettingsProjectMeta = modalState.id === OpenModal.ProjectSettings
    ? projectMetas[modalState.cellId]
    : undefined
  const projectSettingsMemberCount = modalState.id === OpenModal.ProjectSettings
    ? Object.keys(projectMembers[modalState.cellId]).length
    : undefined

  return (
    <>
      <div
        className={`screen-wrapper ${
          networkInfoOpen ? 'network-info-open' : ''
        }`}
      >
        <ErrorBoundaryScreen>
          <ModalContexts.Provider
            // connect the modal contexts to the state
            value={{ modalState, setModalState }}
          >
            <Router>
              {agentAddress && (
                <Header
                  project={activeProjectMeta}
                  {...{
                    members,
                    agentAddress,
                    presentMembers,
                    activeEntryPoints,
                    projectId,
                    whoami,
                    updateStatus,
                    setModalState,
                    setShowProfileEditForm,
                    setShowPreferences,
                    goToOutcome,
                    showUpdateBar,
                    setShowUpdateBar,
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
                    <VersionUpdateLeaving
                      updateVersionInfo={updateVersionInfo}
                      triggerAMigrationCheck={
                        finishMigrationChecker.triggerACheck
                      }
                    />
                  )}
                />
                <Route
                  path="/finish-update"
                  render={() => (
                    <VersionUpdateEntering
                      hasCheckedForMigration={finishMigrationChecker.hasChecked}
                      migrationData={
                        finishMigrationChecker.dataForNeedsMigration
                      }
                      migrationDataFileName={
                        finishMigrationChecker.migrationDataFileName
                      }
                    />
                  )}
                />
                <Route path="/" render={() => <Redirect to="/dashboard" />} />
              </Switch>

              <GlobalModals
                {...{
                  // could be refactored into ModalState context
                  showProfileEditForm,
                  setShowProfileEditForm,
                  showPreferences,
                  setShowPreferences,
                  viewingReleaseNotes,
                  setViewingReleaseNotes,

                  //
                  whoami,
                  projectSettingsProjectMeta,
                  projectSettingsMemberCount,
                  agentAddress,
                  navigationPreference,
                  setNavigationPreference,
                  keyboardNavigationPreference,
                  setKeyboardNavigationPreference,
                  modalState,
                  setModalState,
                  onProfileSubmit,
                  updateVersionInfo,
                  hasMigratedSharedProject,
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
                  agentAddress={agentAddress}
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
          </ModalContexts.Provider>
        </ErrorBoundaryScreen>
      </div>
      {networkInfoOpen && <NetworkInfo versionInfo={updateVersionInfo} />}
    </>
  )
}

export default App
