import React from 'react'
import './ProfileEditFormModal.scss'
import Modal from '../Modal/Modal'
import ProfileEditForm from '../ProfileEditForm/ProfileEditForm'
import { Profile } from 'zod-models'
import { AgentPubKeyB64 } from '../../types/shared'

export type ProfileEditFormModalProps = {
  active: boolean
  onClose: () => void
  onProfileSubmit: (profile: Profile) => Promise<void>
  myLocalProfile: Profile
  agentAddress: AgentPubKeyB64
}

const ProfileEditFormModal: React.FC<ProfileEditFormModalProps> = ({
  active,
  myLocalProfile,
  agentAddress,
  onClose,
  onProfileSubmit,
}) => {
  return (
    <Modal white active={active} onClose={onClose}
      className="edit-profile-modal">
      <ProfileEditForm
        onSubmit={onProfileSubmit}
        myLocalProfile={myLocalProfile}
        pending={false}
        pendingText={'Submitting...'}
        titleText={'Profile Settings'}
        subText={''}
        submitText={'Save Changes'}
        agentAddress={agentAddress}
      />
    </Modal>
  )
}

export default ProfileEditFormModal
