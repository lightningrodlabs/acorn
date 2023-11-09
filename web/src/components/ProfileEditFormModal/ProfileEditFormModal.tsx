import React from 'react'
import './ProfileEditFormModal.scss'
import Modal from '../Modal/Modal'
import ProfileEditForm from '../ProfileEditForm/ProfileEditForm'
import { Profile } from 'zod-models'
import { WireRecord } from '../../api/hdkCrud'
import { AgentPubKeyB64 } from '../../types/shared'

export type ProfileEditFormModalProps = {
  active: boolean
  onClose: () => void
  onProfileSubmit: (profile: Profile) => Promise<void>
  whoami: WireRecord<Profile>
  agentAddress: AgentPubKeyB64
}

const ProfileEditFormModal: React.FC<ProfileEditFormModalProps> = ({
  active,
  whoami,
  agentAddress,
  onClose,
  onProfileSubmit,
}) => {
  return (
    <Modal white active={active} onClose={onClose}>
      <ProfileEditForm
        onSubmit={onProfileSubmit}
        whoami={whoami ? whoami.entry : null}
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
