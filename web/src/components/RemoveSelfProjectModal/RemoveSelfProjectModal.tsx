import React from 'react'

import './RemoveSelfProjectModal.scss'

import Modal from '../Modal/Modal'
import {
  ProjectModalContent,
  ProjectModalContentSpacer,
  ProjectModalHeading,
} from '../ProjectModal/ProjectModal'
import Button from '../Button/Button'
import { CellIdString } from '../../types/shared'

export type RemoveSelfProjectModalProps = {
  showModal: boolean
  projectAppId: string
  projectCellId: CellIdString
  projectName: string
  onClose: () => void
  uninstallProject: (appId: string, cellIdString: CellIdString) => Promise<void>
}

const RemoveSelfProjectModal: React.FC<RemoveSelfProjectModalProps> = ({
  showModal,
  projectAppId,
  projectCellId,
  projectName,
  onClose,
  uninstallProject,
}) => {
  const uninstall = () => {
    uninstallProject(projectAppId, projectCellId)
    onClose()
  }

  return (
    <div className="remove-self-modal">
      <Modal active={showModal} onClose={onClose}>
        <ProjectModalHeading title="Remove self from project" />
        <ProjectModalContentSpacer>
          <ProjectModalContent>
            Are you sure you want to remove yourself from the shared project '
            {projectName}'? If you remove yourself from this project you won’t
            have access to it anymore.
            <p />
            You can join this project again later, as long as it still has
            active members that can be found online and if you have access to
            the project secret.
          </ProjectModalContent>
        </ProjectModalContentSpacer>
        <div className="modal-buttons-wrapper">
          <Button
            text={'Remove me from project'}
            className="warning"
            onClick={uninstall}
          />
          <Button text={'Nevermind'} onClick={onClose} />
        </div>
      </Modal>
    </div>
  )
}

export default RemoveSelfProjectModal
