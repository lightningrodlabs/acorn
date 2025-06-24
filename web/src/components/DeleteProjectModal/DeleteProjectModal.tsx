import React, { useContext } from 'react'

import './DeleteProjectModal.scss'

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

export type DeleteProjectModalProps = {
  modalState: ModalState
  onClose: () => void
  redirectToDashboard: () => void
  uninstallProject: (cellIdString: CellIdString) => Promise<void>
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  modalState,
  onClose,
  redirectToDashboard,
  uninstallProject,
}) => {
  // pull in the toast context
  const { setToastState } = useContext(ToastContext)

  const projectName =
    modalState.id === OpenModal.DeleteProject && modalState.projectName
  const projectAppId =
    modalState.id === OpenModal.DeleteProject && modalState.projectAppId
  const projectCellId =
    modalState.id === OpenModal.DeleteProject && modalState.cellId

  const uninstall = () => {
    redirectToDashboard()
    uninstallProject(projectCellId)
    onClose()
    setToastState({
      id: ShowToast.Yes,
      text: 'Project deleted.',
      type: 'confirmation',
    })
  }

  return (
    <Modal active={modalState.id === OpenModal.DeleteProject} onClose={onClose}>
      <ProjectModalHeading title="Delete project" />
      <ProjectModalContentSpacer>
        <ProjectModalContent>
          Are you sure you want to delete the project <b>'{projectName}'</b>?
          This action will delete all the project data and can’t be undone.
        </ProjectModalContent>
      </ProjectModalContentSpacer>
      <div className="modal-buttons-wrapper">
        <Button
          text={'Delete this project'}
          className="warning"
          onClick={uninstall}
        />
        <Button text={'Never mind'} onClick={onClose} />
      </div>
    </Modal>
  )
}

export default DeleteProjectModal
