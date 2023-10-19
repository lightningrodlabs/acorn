import React from 'react'

import './DeleteProjectModal.scss'

import Modal from '../Modal/Modal'
import {
  ProjectModalContent,
  ProjectModalContentSpacer,
  ProjectModalHeading,
} from '../ProjectModal/ProjectModal'
import Button from '../Button/Button'

export type DeleteProjectModalProps = {
  showModal: boolean
  projectName: string
  onClose: () => void
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  showModal,
  projectName,
  onClose,
}) => {
  return (
    <>
      <Modal active={showModal} onClose={onClose}>
        <ProjectModalHeading title="Delete project" />
        <ProjectModalContentSpacer>
          <ProjectModalContent>
            Are you sure you want to delete the project '{projectName}'? This action will
            delete all the project data and can’t be undone.
          </ProjectModalContent>
        </ProjectModalContentSpacer>
        <div className="modal-buttons-wrapper">
          <Button text={'Delete this project'} className="warning" />
          <Button text={'Nevermind'} />
        </div>
      </Modal>
    </>
  )
}

export default DeleteProjectModal
