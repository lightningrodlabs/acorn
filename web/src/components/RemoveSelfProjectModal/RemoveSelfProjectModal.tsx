import React, { useContext } from 'react'

import './RemoveSelfProjectModal.scss'

import Modal from '../Modal/Modal'
import {
  ProjectModalContent,
  ProjectModalContentSpacer,
  ProjectModalHeading,
} from '../ProjectModal/ProjectModal'
import Button from '../Button/Button'
import { CellIdString } from '../../types/shared'
import ToastContext, { ShowToast } from '../../context/ToastContext'
import { ModalState, OpenModal } from '../../context/ModalContexts'

export type RemoveSelfProjectModalProps = {
  modalState: ModalState
  onClose: () => void
  redirectToDashboard: () => void
  uninstallProject: (appId: string, cellIdString: CellIdString) => Promise<void>
}

const RemoveSelfProjectModal: React.FC<RemoveSelfProjectModalProps> = ({
  modalState,
  onClose,
  redirectToDashboard,
  uninstallProject,
}) => {
  // pull in the toast context
  const { setToastState } = useContext(ToastContext)

  const projectName =
    modalState.id === OpenModal.RemoveSelfProject && modalState.projectName
  const projectAppId =
    modalState.id === OpenModal.RemoveSelfProject && modalState.projectAppId
  const projectCellId =
    modalState.id === OpenModal.RemoveSelfProject && modalState.cellId

  const uninstall = () => {
    redirectToDashboard()
    uninstallProject(projectAppId, projectCellId)
    onClose()
    setToastState({
      id: ShowToast.Yes,
      text: 'You left a shared project.',
      type: 'confirmation',
    })
  }

  return (
    <div className="remove-self-modal">
      <Modal
        active={modalState.id === OpenModal.RemoveSelfProject}
        onClose={onClose}
      >
        <ProjectModalHeading title="Remove self from project" />
        <ProjectModalContentSpacer>
          <ProjectModalContent>
            Are you sure you want to remove yourself from the shared project '
            <b>{projectName}</b>'? If you remove yourself from this project you
            won’t have access to it anymore.
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
