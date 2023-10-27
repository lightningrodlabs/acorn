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

export type DeleteProjectModalProps = {
  showModal: boolean
  projectAppId: string
  projectCellId: CellIdString
  projectName: string
  onClose: () => void
  redirectToDashboard: () => void
  uninstallProject: (appId: string, cellIdString: CellIdString) => Promise<void>
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  showModal,
  projectAppId,
  projectCellId,
  projectName,
  onClose,
  redirectToDashboard,
  uninstallProject,
}) => {
  // pull in the toast context
  const { setToastState } = useContext(ToastContext)

  const uninstall = () => {
    redirectToDashboard()
    uninstallProject(projectAppId, projectCellId)
    onClose()
    setToastState({
      id: ShowToast.Yes,
      text: 'Project deleted.',
      type: 'confirmation',
    })
  }

  return (
    <>
      <Modal active={showModal} onClose={onClose}>
        <ProjectModalHeading title="Delete project" />
        <ProjectModalContentSpacer>
          <ProjectModalContent>
            Are you sure you want to delete the project <b>'{projectName}'</b>? This
            action will delete all the project data and can’t be undone.
          </ProjectModalContent>
        </ProjectModalContentSpacer>
        <div className="modal-buttons-wrapper">
          <Button
            text={'Delete this project'}
            className="warning"
            onClick={uninstall}
          />
          <Button text={'Nevermind'} onClick={onClose} />
        </div>
      </Modal>
    </>
  )
}

export default DeleteProjectModal
