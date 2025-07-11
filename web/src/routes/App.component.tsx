import React, { useEffect, useState } from 'react'
import { Redirect, HashRouter as Router, Switch, Route } from 'react-router-dom'

import {
  ActionHashB64,
  AgentPubKeyB64,
  CellIdString,
  WithActionHash,
  Option
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
import NetworkInfo from '../components/NetworkInfo/NetworkInfo'
import Toast from '../components/Toast/Toast'

// import new routes here
import CreateProfilePage from './CreateProfilePage/CreateProfilePage.connector'
import Dashboard from './Dashboard/Dashboard.connector'
import ProjectView from './ProjectView/ProjectView.connector'
import VersionUpdateLeaving from './VersionUpdateLeaving/VersionUpdateLeaving'
import VersionUpdateEntering from './VersionUpdateEntering/VersionUpdateEntering'
import IntroScreen from '../components/IntroScreen/IntroScreen'
import ErrorBoundaryScreen from '../components/ErrorScreen/ErrorScreen'

// all global modals in here
import GlobalModals from './GlobalModals'

// hooks
import useVersionChecker from '../hooks/useVersionChecker'
import useFinishMigrationChecker from '../hooks/useFinishMigrationChecker'
import useFileDownloaded from '../hooks/useFileDownloaded'

// react context
import ModalContexts, { ModalState, OpenModal } from '../context/ModalContexts'
import ToastContext, { ToastState, ShowToast } from '../context/ToastContext'

// redux
import {
  COORDINATES,
  KeyboardNavigationPreference,
  MODAL,
  NavigationPreference,
} from '../redux/ephemeral/local-preferences/reducer.js'
import { ProjectMetaState } from '../redux/persistent/projects/project-meta/reducer'
import { MembersState } from '../redux/persistent/projects/members/reducer'
import useHolochainErrorAndLog from '../hooks/useHolochainErrorAndLog'
import AppWebsocketContext from '../context/AppWebsocketContext'
import { AppClient } from '@holochain/client'
import { App } from 'electron'
import { isWeaveContext } from '@theweave/api'
import { writeMyLocalProfile } from '../utils'
import { setMyLocalProfile } from '../redux/persistent/profiles/my-local-profile/actions'

export type AppStateProps = {
  /**
   * Meta info for all projects, keyed by CellIds of the projects
   */
  projectMetas: ProjectMetaState
  /**
   * Member info for all projects, keyed by CellIds of the projects
   */
  projectMembers: MembersState
  /**
   * Cell ids of all projects
   */
  projects: CellIdString[]
  /**
   * Profiles of the currently active/selected project
   */
  activeProjectProfiles: Profile[]
  activeProjectMembersPresent: AgentPubKeyB64[]
  activeEntryPoints: {
    entryPoint: WithActionHash<EntryPoint>
    outcome: WithActionHash<Outcome>
  }[]
  activeProjectMeta: WithActionHash<ProjectMeta>
  /**
   * The CellId of the currently active/selected project
   */
  projectId: CellIdString
  /**
   * My profile as stored in localStorage or retrieved from Moss. Acts
   * as the source of thruth for my profile in the respective projects'
   * dnas
   */
  myLocalProfile: Option<Profile>
  agentAddress: AgentPubKeyB64
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
  unselectAll: () => void
}

export type AppMergeProps = {
  uninstallProject: (cellIdString: CellIdString) => Promise<void>
  updateWhoamis: (entry: Profile) => Promise<void>
  setSelectedLayeringAlgo: (
    layeringAlgorithm: LayeringAlgorithm
  ) => Promise<void>
  updateProjectMeta: (
    projectMeta: ProjectMeta,
    actionHash: ActionHashB64,
    cellIdString: CellIdString
  ) => Promise<void>
}

export type AppOwnProps = {
  appWebsocket?: AppClient
}

export type AppReduxProps = AppStateProps & AppDispatchProps & AppMergeProps

export type AppProps = AppOwnProps & AppReduxProps

const App: React.FC<AppProps> = ({
  // connections
  appWebsocket,
  dispatch,
  // data
  projectMetas,
  projectMembers,
  activeProjectProfiles,
  activeProjectMembersPresent,
  activeEntryPoints,
  activeProjectMeta,
  projectId,
  agentAddress,
  myLocalProfile,
  navigationPreference,
  keyboardNavigationPreference,
  hasMigratedSharedProject,
  hiddenAchievedOutcomes,
  hiddenSmallOutcomes,
  selectedLayeringAlgo,
  // functions
  updateProjectMeta,
  updateWhoamis,
  setNavigationPreference,
  setKeyboardNavigationPreference,
  goToOutcome,
  showSmallOutcomes,
  hideSmallOutcomes,
  showAchievedOutcomes,
  hideAchievedOutcomes,
  setSelectedLayeringAlgo,
  uninstallProject,
  unselectAll,
}) => {
  const [networkInfoOpen, setNetworkInfoOpen] = useState(false)

  // Default state for modals and their details
  const [modalState, setModalState] = useState<ModalState>({
    id: OpenModal.None,
  })
  // Default state for toast and its details
  // the details are defined within toastState
  // which is defined inside ToastContext
  const [toastState, setToastState] = useState<ToastState>({
    id: ShowToast.No,
  })

  const setModalToNone = () => setModalState({ id: OpenModal.None })

  const [showUpdateBar, setShowUpdateBar] = useState(false)
  // custom hooks
  const updateVersionInfo = useVersionChecker()
  // to do development testing of migration-feature
  // uncomment the following line (and comment the one above)
  // const updateVersionInfo = useVersionChecker(true)
  const finishMigrationChecker = useFinishMigrationChecker()
  const { fileDownloaded, setFileDownloaded } = useFileDownloaded()
  const {
    wasmLogs,
    holochainLogs,
    errors: holochainErrors,
  } = useHolochainErrorAndLog()

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

  // when opening a modal, unselect any Outcomes that are selected
  useEffect(() => {
    if (modalState.id !== OpenModal.None) {
      // unselect any selected outcomes
      unselectAll()
    }
  }, [modalState])

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
    writeMyLocalProfile(profile)
    dispatch(setMyLocalProfile(profile))
    await updateWhoamis(profile)
    setModalToNone()
    setToastState({
      id: ShowToast.Yes,
      type: 'confirmation',
      text: 'Profile saved',
    })
  }
  const updateStatus = async (statusString: Profile['status']) => {
    await updateWhoamis(
      {
        ...myLocalProfile,
        status: statusString,
      },
    )
  }

  const redirToIntro =
    agentAddress &&
    !myLocalProfile &&
    !isWeaveContext() &&
    finishMigrationChecker.hasChecked &&
    !finishMigrationChecker.dataForNeedsMigration

  const redirToFinishMigration =
    agentAddress &&
    finishMigrationChecker.hasChecked &&
    finishMigrationChecker.dataForNeedsMigration

  const projectSettingsProjectMeta =
    modalState.id === OpenModal.ProjectSettings
      ? projectMetas[modalState.cellId]
      : undefined
  const projectMigratedProjectMeta =
    modalState.id === OpenModal.ProjectMigrated
      ? projectMetas[modalState.cellId]
      : undefined
  const projectSettingsMemberCount =
    modalState.id === OpenModal.ProjectSettings
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
          {/* Provide context for modals */}
          <ModalContexts.Provider
            // connect the modal contexts to the state
            value={{ modalState, setModalState }}
          >
            {/* Provide context for modals */}
            <ToastContext.Provider
              // connect the toast context to the state
              value={{ toastState, setToastState }}
            >
              <AppWebsocketContext.Provider value={appWebsocket}>
                <Router>
                  {(myLocalProfile &&
                    <Header
                      project={activeProjectMeta}
                      {...{
                        members: activeProjectProfiles,
                        presentMembers: activeProjectMembersPresent,
                        myLocalProfile,
                        setModalState,
                        activeEntryPoints,
                        projectId,
                        updateStatus,
                        goToOutcome,
                        showUpdateBar,
                        setShowUpdateBar,
                        hasMigratedSharedProject,
                        unselectAll,
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
                          hasCheckedForMigration={
                            finishMigrationChecker.hasChecked
                          }
                          migrationData={
                            finishMigrationChecker.dataForNeedsMigration
                          }
                          migrationDataFileName={
                            finishMigrationChecker.migrationDataFileName
                          }
                        />
                      )}
                    />
                    <Route
                      path="/"
                      render={() => <Redirect to="/dashboard" />}
                    />
                  </Switch>

                  <GlobalModals
                    {...{
                      myLocalProfile,
                      projectSettingsProjectMeta,
                      projectSettingsMemberCount,
                      projectMigratedProjectMeta,
                      agentAddress,
                      navigationPreference,
                      setNavigationPreference,
                      keyboardNavigationPreference,
                      setKeyboardNavigationPreference,
                      modalState,
                      setModalState,
                      setShowUpdateBar,
                      onProfileSubmit,
                      updateVersionInfo,
                      hasMigratedSharedProject,
                      uninstallProject,
                      updateProjectMeta,
                    }}
                  />
                  {/* Loading Screen if no user agent, and also during checking whether migration is necessary */}
                  {!(agentAddress && finishMigrationChecker.hasChecked) && (
                    <LoadingScreen />
                  )}
                  {redirToIntro && <Redirect to="/intro" />}
                  {redirToFinishMigration && <Redirect to="/finish-update" />}
                  {agentAddress && myLocalProfile && (
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
                      unselectAll={unselectAll}
                    />
                  )}
                </Router>
              </AppWebsocketContext.Provider>
              {/* Render Toast component here */}
              <Toast toastState={toastState} setToastState={setToastState} />
            </ToastContext.Provider>
          </ModalContexts.Provider>
        </ErrorBoundaryScreen>
      </div>
      {networkInfoOpen && (
        <NetworkInfo
          versionInfo={updateVersionInfo}
          wasmLogs={wasmLogs}
          holochainLogs={holochainLogs}
          errors={holochainErrors}
        />
      )}
    </>
  )
}

export default App
