import React from 'react'
import ReactMarkdown from 'react-markdown'

import Modal, { ModalContent } from '../components/Modal/Modal'
import Preferences from '../components/Preferences/Preferences'
import ProfileEditForm from '../components/ProfileEditForm/ProfileEditForm'
import ProjectSettingsModal from '../components/ProjectSettingsModal/ProjectSettingsModal.connector'
import InviteMembersModal from '../components/InviteMembersModal/InviteMembersModal'
import { WireRecord } from '../api/hdkCrud'
import { Profile, ProjectMeta } from '../types'
import { AgentPubKeyB64, WithActionHash } from '../types/shared'
import UpdateModal, {
  ViewingReleaseNotes,
} from '../components/UpdateModal/UpdateModal'
import {
  KeyboardNavigationPreference,
  NavigationPreference,
} from '../redux/ephemeral/local-preferences/reducer'
import { VersionInfo } from '../hooks/useVersionChecker'
import DeleteProjectModal from '../components/DeleteProjectModal/DeleteProjectModal'
import RemoveSelfProjectModal from '../components/RemoveSelfProjectModal/RemoveSelfProjectModal'
import { ModalState, OpenModal } from '../context/ModalContexts'

export type GlobalModalsProps = {
  // could be refactored into ModalState context
  showProfileEditForm: boolean
  setShowProfileEditForm: (val: boolean) => void
  showPreferences: boolean
  setShowPreferences: (val: boolean) => void
  viewingReleaseNotes: ViewingReleaseNotes
  setViewingReleaseNotes: React.Dispatch<
    React.SetStateAction<ViewingReleaseNotes>
  >

  //
  whoami: WireRecord<Profile>
  projectSettingsProjectMeta: WithActionHash<ProjectMeta>
  projectSettingsMemberCount: number
  agentAddress: AgentPubKeyB64
  navigationPreference: NavigationPreference
  setNavigationPreference: (preference: NavigationPreference) => void
  keyboardNavigationPreference: KeyboardNavigationPreference
  setKeyboardNavigationPreference: (
    preference: KeyboardNavigationPreference
  ) => void
  modalState: ModalState
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
  onProfileSubmit: (profile: Profile) => Promise<void>
  hasMigratedSharedProject: boolean
  updateVersionInfo: VersionInfo
}

const GlobalModals: React.FC<GlobalModalsProps> = ({
  // could be refactored into ModalState context
  showProfileEditForm,
  setShowProfileEditForm,
  showPreferences,
  setShowPreferences,
  //
  whoami,
  projectSettingsProjectMeta,
  projectSettingsMemberCount,
  agentAddress,
  modalState,
  setModalState,
  navigationPreference,
  setNavigationPreference,
  keyboardNavigationPreference,
  setKeyboardNavigationPreference,
  onProfileSubmit,
  hasMigratedSharedProject,
  updateVersionInfo,
  viewingReleaseNotes,
  setViewingReleaseNotes,
}) => {
  // profile edit modal
  const titleText = 'Profile Settings'
  const subText = ''
  // This is hardcoded on purpose, not a big deal because the modal closes
  // when the user hits 'Save Changes'
  const pending = false
  const pendingText = 'Submitting...'
  const submitText = 'Save Changes'

  const setModalToNone = () => setModalState({ id: OpenModal.None })

  return (
    <>
      {/* This will only show when 'active' prop is true */}
      {/* Profile Settings Modal */}
      <Modal
        white
        active={showProfileEditForm}
        onClose={() => setShowProfileEditForm(false)}
      >
        <ProfileEditForm
          onSubmit={onProfileSubmit}
          whoami={whoami ? whoami.entry : null}
          {...{
            pending,
            pendingText,
            titleText,
            subText,
            submitText,
            agentAddress,
          }}
        />
      </Modal>
      {/* Preferences Modal */}
      <Preferences
        navigation={navigationPreference}
        setNavigationPreference={setNavigationPreference}
        showPreferences={showPreferences}
        setShowPreferences={setShowPreferences}
        keyboardNavigation={keyboardNavigationPreference}
        setKeyboardNavigationPreference={setKeyboardNavigationPreference}
      />
      {/* Project Settings Modal */}
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
        passphrase={
          modalState.id === OpenModal.InviteMembers && modalState.passphrase
        }
        showModal={modalState.id === OpenModal.InviteMembers}
        onClose={setModalToNone}
      />
      <DeleteProjectModal
        showModal={modalState.id === OpenModal.DeleteProject}
        projectName={
          modalState.id === OpenModal.DeleteProject && modalState.projectName
        }
        onClose={setModalToNone}
      />
      <RemoveSelfProjectModal
        showModal={modalState.id === OpenModal.RemoveSelfProject}
        projectName={
          modalState.id === OpenModal.RemoveSelfProject &&
          modalState.projectName
        }
        onClose={setModalToNone}
      />

      {/* Update Prompt Modal */}
      <UpdateModal
        show={modalState.id === OpenModal.UpdateApp}
        onClose={setModalToNone}
        releaseTag={updateVersionInfo.newReleaseVersion}
        releaseSize={updateVersionInfo.sizeForPlatform}
        heading={
          viewingReleaseNotes === ViewingReleaseNotes.MainMessage
            ? 'Update to newest version of Acorn'
            : 'Release Notes'
        }
        content={
          <>
            {viewingReleaseNotes === ViewingReleaseNotes.MainMessage && (
              <div>
                {hasMigratedSharedProject ? (
                  <>
                    Update is required to access a shared project brought to the
                    updated version by another team member. You can continue
                    using your personal projects without the update.
                  </>
                ) : (
                  <>
                    By updating you'll gain access to bug fixes, new features,
                    and other improvements.
                  </>
                )}{' '}
                See{' '}
                <a
                  onClick={() =>
                    setViewingReleaseNotes(ViewingReleaseNotes.ReleaseNotes)
                  }
                >
                  Release Notes & Changelog
                </a>
                .
              </div>
            )}
            {viewingReleaseNotes === ViewingReleaseNotes.ReleaseNotes && (
              <ReactMarkdown>{updateVersionInfo.releaseNotes}</ReactMarkdown>
            )}
          </>
        }
      />

      {/* Export Successful Modal */}
      <Modal
        active={modalState.id === OpenModal.ProjectExported}
        onClose={setModalToNone}
      >
        <ModalContent
          heading="Exporting"
          icon="export.svg"
          content={
            <>
              You just exported the{' '}
              <b>
                {modalState.id === OpenModal.ProjectExported &&
                  modalState.projectName}
              </b>{' '}
              project data. You can use that file to transfer the project to a
              different owner, or archive as a backup.
            </>
          }
          primaryButton="Got it"
          primaryButtonAction={setModalToNone}
        />
      </Modal>
    </>
  )
}

export default GlobalModals
