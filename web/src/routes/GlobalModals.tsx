import React from 'react'
import ReactMarkdown from 'react-markdown'

import Modal, { ModalContent } from '../components/Modal/Modal'
import Preferences from '../components/Preferences/Preferences'
import ProfileEditForm from '../components/ProfileEditForm/ProfileEditForm'
import ProjectSettingsModal from '../components/ProjectSettingsModal/ProjectSettingsModal.connector'
import InviteMembersModal from '../components/InviteMembersModal/InviteMembersModal'
import { WireRecord } from '../api/hdkCrud'
import { Profile, ProjectMeta } from '../types'
import { AgentPubKeyB64, CellIdString, WithActionHash } from '../types/shared'
import UpdateModal, {
  ViewingReleaseNotes,
} from '../components/UpdateModal/UpdateModal'

export type GlobalModalsProps = {
  whoami: WireRecord<Profile>
  activeProjectMeta: WithActionHash<ProjectMeta>
  projectId: CellIdString
  agentAddress: AgentPubKeyB64
  navigationPreference: 'mouse' | 'trackpad'
  setNavigationPreference: (preference: 'mouse' | 'trackpad') => void
  showProfileEditForm: boolean
  setShowProfileEditForm: (val: boolean) => void
  showPreferences: boolean
  setShowPreferences: (val: boolean) => void
  showProjectSettingsModal: boolean
  setShowProjectSettingsOpen: (val: boolean) => void
  inviteMembersModalShowing: null | string // will be the passphrase if defined
  openInviteMembersModal: (passphrase: string) => void
  hideInviteMembersModal: () => void
  onProfileSubmit: (profile: Profile) => Promise<void>
  hasMigratedSharedProject: boolean
  showUpdateModal: boolean
  onCloseUpdateModal: () => void
  updateVersionInfo: {
    name: string
    releaseNotes: string
    sizeForPlatform: string
  }
  // single manual project export
  exportedProjectName: string
  showExportedModal: boolean
  setShowExportedModal: (show: boolean) => void
  viewingReleaseNotes: ViewingReleaseNotes
  setViewingReleaseNotes: React.Dispatch<
    React.SetStateAction<ViewingReleaseNotes>
  >
}

const GlobalModals: React.FC<GlobalModalsProps> = ({
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
  hasMigratedSharedProject,
  showUpdateModal,
  onCloseUpdateModal,
  updateVersionInfo,
  exportedProjectName,
  showExportedModal,
  setShowExportedModal,
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
      />
      {/* Project Settings Modal */}
      <ProjectSettingsModal
        showModal={showProjectSettingsModal}
        onClose={() => setShowProjectSettingsOpen(false)}
        project={activeProjectMeta}
        cellIdString={projectId}
        openInviteMembersModal={openInviteMembersModal}
      />
      <InviteMembersModal
        passphrase={inviteMembersModalShowing}
        showModal={inviteMembersModalShowing}
        onClose={hideInviteMembersModal}
      />
      {/* Update Prompt Modal */}
      <UpdateModal
        show={showUpdateModal}
        onClose={onCloseUpdateModal}
        releaseTag={updateVersionInfo ? updateVersionInfo.name : ''}
        releaseSize={updateVersionInfo ? updateVersionInfo.sizeForPlatform : ''}
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
                  <>There is a new release of Acorn that you can update to.</>
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
              <ReactMarkdown>
                {updateVersionInfo ? updateVersionInfo.releaseNotes : ''}
              </ReactMarkdown>
            )}
          </>
        }
      />

      {/* Export Successful Modal */}
      <Modal
        active={showExportedModal}
        onClose={() => setShowExportedModal(false)}
      >
        <ModalContent
          heading="Exporting"
          icon="export.svg"
          content={
            <>
              You just exported the <b>{exportedProjectName}</b> project data.
              You can use that file to transfer the project to a different
              owner, or archive as a backup.
            </>
          }
          primaryButton="Got it"
          primaryButtonAction={() => setShowExportedModal(false)}
        />
      </Modal>
    </>
  )
}

export default GlobalModals
