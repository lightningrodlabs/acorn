import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import GuideBook from '../components/GuideBook/GuideBook'
import { GUIDE_IS_OPEN } from '../searchParams'
import Modal from '../components/Modal/Modal'
import Preferences from '../components/Preferences/Preferences'
import ProfileEditForm from '../components/ProfileEditForm/ProfileEditForm'
import ProjectSettingsModal from '../components/ProjectSettingsModal/ProjectSettingsModal'
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
  onProfileSubmit,
}) {
  // check the url for GUIDE_IS_OPEN
  // and affect the state
  const location = useLocation()
  const history = useHistory()
  const searchParams = new URLSearchParams(location.search)
  const isGuideOpen = !!searchParams.get(GUIDE_IS_OPEN)
  const onCloseGuidebook = () => {
    const pathWithoutGuidebook = location.pathname
    history.push(pathWithoutGuidebook)
  }

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
      />
      {/* Guidebook */}
      <Modal
        className="guidebook-modal"
        white
        active={isGuideOpen}
        onClose={onCloseGuidebook}
      >
        <GuideBook />
      </Modal>
      {/* Update Prompt Modal */}
      {/* <UpdatePromptModal
          show={showUpdatePromptModal}
          onClose={onCloseUpdatePromptModal}
        /> */}
    </>
  )
}
