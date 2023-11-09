import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import { WireRecord } from '../api/hdkCrud'
import { Profile, ProjectMeta } from '../types'
import {
  ActionHashB64,
  AgentPubKeyB64,
  CellIdString,
  WithActionHash,
} from '../types/shared'
import {
  KeyboardNavigationPreference,
  NavigationPreference,
} from '../redux/ephemeral/local-preferences/reducer'
import { VersionInfo } from '../hooks/useVersionChecker'
import { ModalState, OpenModal } from '../context/ModalContexts'
import Preferences from '../components/Preferences/Preferences'
import ProjectSettingsModal from '../components/ProjectSettingsModal/ProjectSettingsModal.connector'
import InviteMembersModal from '../components/InviteMembersModal/InviteMembersModal'
import DeleteProjectModal from '../components/DeleteProjectModal/DeleteProjectModal'
import RemoveSelfProjectModal from '../components/RemoveSelfProjectModal/RemoveSelfProjectModal'
import ProjectMigratedModal from '../components/ProjectMigratedModal/ProjectMigratedModal'
import ProfileEditFormModal from '../components/ProfileEditFormModal/ProfileEditFormModal'
import UpdateModal, {
  ViewingReleaseNotes,
} from '../components/UpdateModal/UpdateModal'

export type GlobalModalsProps = {
  // data
  modalState: ModalState
  whoami: WireRecord<Profile>
  projectSettingsProjectMeta: WithActionHash<ProjectMeta>
  projectSettingsMemberCount: number
  projectMigratedProjectMeta: WithActionHash<ProjectMeta>
  agentAddress: AgentPubKeyB64
  navigationPreference: NavigationPreference
  keyboardNavigationPreference: KeyboardNavigationPreference
  hasMigratedSharedProject: boolean
  updateVersionInfo: VersionInfo
  // functions
  setNavigationPreference: (preference: NavigationPreference) => void
  setKeyboardNavigationPreference: (
    preference: KeyboardNavigationPreference
  ) => void
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
  setShowUpdateBar: React.Dispatch<React.SetStateAction<boolean>>
  onProfileSubmit: (profile: Profile) => Promise<void>
  uninstallProject: (appId: string, cellIdString: CellIdString) => Promise<void>
  updateProjectMeta: (
    projectMeta: ProjectMeta,
    actionHash: ActionHashB64,
    cellIdString: CellIdString
  ) => Promise<void>
}

const GlobalModals: React.FC<GlobalModalsProps> = ({
  // data
  whoami,
  projectSettingsProjectMeta,
  projectSettingsMemberCount,
  projectMigratedProjectMeta,
  agentAddress,
  modalState,
  navigationPreference,
  keyboardNavigationPreference,
  hasMigratedSharedProject,
  updateVersionInfo,
  // functions
  onProfileSubmit,
  setKeyboardNavigationPreference,
  setNavigationPreference,
  setShowUpdateBar,
  setModalState,
  uninstallProject,
  updateProjectMeta,
}) => {
  const history = useHistory()

  const setModalToNone = () => setModalState({ id: OpenModal.None })
  const redirectToDashboard = () => {
    history.push('/dashboard')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setModalToNone()
      }
    }

    if (modalState.id !== OpenModal.None) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [modalState])

  return (
    <>
      <ProfileEditFormModal
        active={modalState.id === OpenModal.ProfileEditForm}
        onClose={setModalToNone}
        onProfileSubmit={onProfileSubmit}
        whoami={whoami}
        agentAddress={agentAddress}
      />
      <Preferences
        navigationPreference={navigationPreference}
        setNavigationPreference={setNavigationPreference}
        modalState={modalState}
        setModalState={setModalState}
        keyboardNavigationPreference={keyboardNavigationPreference}
        setKeyboardNavigationPreference={setKeyboardNavigationPreference}
      />
      <ProjectSettingsModal
        showModal={modalState.id === OpenModal.ProjectSettings}
        onClose={setModalToNone}
        project={projectSettingsProjectMeta}
        cellIdString={
          modalState.id === OpenModal.ProjectSettings
            ? modalState.cellId
            : undefined
        }
        setModalState={setModalState}
        memberCount={projectSettingsMemberCount}
      />
      <InviteMembersModal
        showModal={modalState.id === OpenModal.InviteMembers}
        passphrase={
          modalState.id === OpenModal.InviteMembers && modalState.passphrase
        }
        onClose={setModalToNone}
      />
      <DeleteProjectModal
        modalState={modalState}
        onClose={setModalToNone}
        uninstallProject={uninstallProject}
        redirectToDashboard={redirectToDashboard}
      />
      <RemoveSelfProjectModal
        modalState={modalState}
        onClose={setModalToNone}
        uninstallProject={uninstallProject}
        redirectToDashboard={redirectToDashboard}
      />
      <ProjectMigratedModal
        showModal={modalState.id === OpenModal.ProjectMigrated}
        onClose={setModalToNone}
        project={projectMigratedProjectMeta}
        onClickOverride={() => {
          setModalToNone()
          updateProjectMeta(
            {
              ...projectMigratedProjectMeta,
              isMigrated: null,
            },
            projectMigratedProjectMeta.actionHash,
            modalState.id === OpenModal.ProjectMigrated && modalState.cellId
          )
        }}
        onClickUpdateNow={() => {
          setModalState({
            id: OpenModal.UpdateApp,
            section: ViewingReleaseNotes.MainMessage,
          })
        }}
      />
      <UpdateModal
        show={modalState.id === OpenModal.UpdateApp}
        onClose={() => {
          setModalToNone()
          setShowUpdateBar(true)
        }}
        releaseTag={updateVersionInfo.newReleaseVersion}
        releaseSize={updateVersionInfo.sizeForPlatform}
        releaseNotes={updateVersionInfo.releaseNotes}
        modalState={modalState}
        setModalState={setModalState}
        hasMigratedSharedProject={hasMigratedSharedProject}
      />
    </>
  )
}

export default GlobalModals
