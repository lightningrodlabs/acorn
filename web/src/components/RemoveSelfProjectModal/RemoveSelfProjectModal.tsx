import React from 'react'

import './RemoveSelfProjectModal.scss'

import Modal from '../Modal/Modal'
import {
  ProjectModalContent,
  ProjectModalContentSpacer,
  ProjectModalHeading,
} from '../ProjectModal/ProjectModal'
import Button from '../Button/Button'

export type RemoveSelfProjectModalProps = {
  showModal: boolean
  projectName: string
  onClose: () => void
}

const RemoveSelfProjectModal: React.FC<RemoveSelfProjectModalProps> = ({
  showModal,
  projectName,
  onClose,
}) => {
  return (
    <div className="remove-self-modal">
      <Modal active={showModal} onClose={onClose}>
        <ProjectModalHeading title="Remove self from project" />
        <ProjectModalContentSpacer>
          <ProjectModalContent>
            Are you sure you want to remove yourself from the shared project{' '}
            '{projectName}'? If you remove yourself from this project you won’t
            have access to it anymore.
            <p />
            You can join this project again later, as long as it still has
            active members that can be found online and if you have access to
            the project secret.
          </ProjectModalContent>
        </ProjectModalContentSpacer>
        <div className="modal-buttons-wrapper">
          <Button text={'Remove me from project'} className="warning" />
          <Button text={'Nevermind'} />
        </div>
      </Modal>
    </div>
  )
}

export default RemoveSelfProjectModal
