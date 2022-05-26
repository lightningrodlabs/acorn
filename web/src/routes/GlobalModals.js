import React from 'react'

import Modal from '../components/Modal/Modal'
import Preferences from '../components/Preferences/Preferences'
import ProfileEditForm from '../components/ProfileEditForm/ProfileEditForm'
import ProjectSettingsModal from '../components/ProjectSettingsModal/ProjectSettingsModal.connector'
import InviteMembersModal from '../components/InviteMembersModal/InviteMembersModal'
// import UpdatePromptModal from '../components/UpdatePromptModal/UpdatePromptModal'

export default function GlobalModals({
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
}) {

  // profile edit modal
  const titleText = 'Profile Settings'
  const subText = ''
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
          {...{ titleText, subText, submitText, agentAddress }}
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
      {/* <UpdatePromptModal
          show={showUpdatePromptModal}
          onClose={onCloseUpdatePromptModal}
        /> */}
    </>
  )
}
