import React from 'react'
import './InviteMembersModal.scss'

import Modal from '../Modal/Modal'
import {
  ProjectModalButton,
  ProjectModalContent,
  ProjectModalContentSpacer,
  ProjectModalHeading,
  ProjectModalSubHeading,
} from '../ProjectModal/ProjectModal'
import ProjectSecret from '../ProjectSecret/ProjectSecret'

export default function InviteMembersModal({ showModal, onClose, passphrase }) {
  return (
    <Modal
      white
      active={showModal}
      onClose={onClose}
      className="invite-members-modal"
    >
      <ProjectModalHeading title="Invite members to project" />
      <ProjectModalSubHeading title="Share this secret phrase with people you want to invite to this project." />
      <ProjectModalContent>
        <ProjectModalContentSpacer>
          <ProjectSecret passphrase={passphrase} />
        </ProjectModalContentSpacer>
      </ProjectModalContent>
      <ProjectModalButton text="Done" onClick={onClose} />
    </Modal>
  )
}
