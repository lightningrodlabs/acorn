import React from 'react'
import './ProjectMigratedModal.scss'
import Modal, { ModalContent } from '../Modal/Modal'
import { WithActionHash } from '../../types/shared'
import { ProjectMeta } from '../../types'

export type ProjectMigratedModalProps = {
  showModal: boolean
  onClose: () => void
  project?: WithActionHash<ProjectMeta>
  onClickUpdateNow: () => void
  onClickOverride: () => void
}

const ProjectMigratedModal: React.FC<ProjectMigratedModalProps> = ({
  showModal,
  onClose,
  project = { isMigrated: '' } as WithActionHash<ProjectMeta>,
  onClickUpdateNow,
  onClickOverride,
}) => {
  return (
    <Modal
      white
      active={showModal}
      onClose={onClose}
      className="project-settings"
    >
      <ModalContent
        content={
          <>
            You or a team member migrated (or attempted to) this project to
            Acorn version {project.isMigrated}. You will need to update to a
            version that starts with <b>{project.isMigrated.split('.')[0]}</b>{' '}
            to continue working on this project.
            <br />
            <br />
            If something went wrong, you may override and continue working on
            this project in the current version. Be careful, this could lead to
            divergence between the two versions of the project.
          </>
        }
        heading={'This project was migrated'}
        primaryButton={'Update Now'}
        primaryButtonAction={onClickUpdateNow}
        altButton={'Override'}
        altButtonAction={onClickOverride}
      />
    </Modal>
  )
}

export default ProjectMigratedModal
