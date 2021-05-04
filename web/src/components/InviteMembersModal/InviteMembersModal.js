import React from 'react'
import './InviteMembersModal.css'

import Modal from '../Modal/Modal'
import {
  ProjectModalButton,
  ProjectModalContent,
  ProjectModalContentSpacer,
  ProjectModalHeading,
} from '../ProjectModal/ProjectModal'
import ProjectSecret from '../ProjectSecret/ProjectSecret'

export default function InviteMembersModal({ showModal, onClose, passphrase }) {
  const onDone = () => {
    onClose()
  }

  return (
    <Modal
      white
      active={showModal}
      onClose={onClose}
      className='join-project-modal-wrapper'>
      <ProjectModalHeading title='Invite members to project' />
      <ProjectModalContent>
        <ProjectModalContentSpacer>
          <ProjectSecret passphrase={passphrase} />
        </ProjectModalContentSpacer>
      </ProjectModalContent>
      <ProjectModalButton text='Done' onClick={onDone} />
    </Modal>
  )
}
