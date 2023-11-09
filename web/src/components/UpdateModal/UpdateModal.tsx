import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import './UpdateModal.scss'

import Modal from '../Modal/Modal'
import Button from '../Button/Button'
import Typography from '../Typography/Typography'
import Tag from '../Tag/Tag'
import { ModalState, OpenModal } from '../../context/ModalContexts'

export enum ViewingReleaseNotes {
  ReleaseNotes,
  MainMessage,
}

export type UpdateModalProps = {
  show: boolean
  modalState: ModalState
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
  onClose: () => void
  releaseTag: string
  releaseSize?: string
  releaseNotes: string
  hasMigratedSharedProject: boolean
}

const Content = ({
  modalState,
  releaseNotes,
  setModalState,
  hasMigratedSharedProject,
}: {
  hasMigratedSharedProject: boolean
  modalState: ModalState
  releaseNotes: string
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
}) => {
  return (
    <Typography style={'body-modal'}>
      {modalState.id === OpenModal.UpdateApp &&
        modalState.section === ViewingReleaseNotes.MainMessage && (
          <div>
            {hasMigratedSharedProject ? (
              <>
                Update is required to access a shared project brought to the
                updated version by another team member. You can continue using
                your personal projects without the update.
              </>
            ) : (
              <>
                By updating you'll gain access to bug fixes, new features, and
                other improvements.
              </>
            )}{' '}
            See{' '}
            <a
              onClick={() =>
                setModalState({
                  id: OpenModal.UpdateApp,
                  section: ViewingReleaseNotes.ReleaseNotes,
                })
              }
            >
              Release Notes & Changelog
            </a>
            .
          </div>
        )}
      {modalState.id === OpenModal.UpdateApp &&
        modalState.section === ViewingReleaseNotes.ReleaseNotes && (
          <ReactMarkdown>{releaseNotes}</ReactMarkdown>
        )}
    </Typography>
  )
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  show,
  modalState,
  setModalState,
  onClose,
  releaseTag,
  releaseSize,
  releaseNotes,
  hasMigratedSharedProject,
}) => {
  const history = useHistory()
  const runUpdate = () => {
    onClose()
    history.push('/run-update')
  }

  // These are for dynamic calculatio of content height and screen height
  const [contentDiv, setContentDiv] = useState<HTMLDivElement>()
  const [screenHeight, setScreenHeight] = useState<number>()
  const [contentHeight, setContentHeight] = useState<number>()

  useEffect(() => {
    const windowResize = () => {
      setScreenHeight(screen.height)
    }
    setScreenHeight(screen.height)
    window.addEventListener('resize', windowResize)
    return () => {
      window.removeEventListener('resize', windowResize)
    }
  }, [])

  // when content changes,
  // update the height, so that it can switch to scrollable
  useEffect(() => {
    if (contentDiv) {
      setContentHeight(contentDiv.clientHeight)
    }
  }, [contentDiv, releaseNotes, modalState, hasMigratedSharedProject])

  const heading =
    modalState.id === OpenModal.UpdateApp &&
    modalState.section === ViewingReleaseNotes.MainMessage
      ? 'Update to newest version of Acorn'
      : 'Release Notes'

  return (
    <div className="update-modal-wrapper">
      <Modal white active={show} onClose={onClose}>
        <div className="update-modal-content-wrapper">
          {/* Release tag */}
          <div className="update-modal-release-tag-size">
            <div className="update-modal-release-tag-wrapper">
              <Tag
                text={`Release ${releaseTag}`}
                backgroundColor={'#277670'}
              ></Tag>
            </div>

            {/* Release size */}
            {releaseSize && (
              <div className="update-modal-release-size">{releaseSize}</div>
            )}
          </div>
          {/* Heading */}
          <div className="update-modal-heading">
            <Typography style={'heading-modal'}>{heading}</Typography>
          </div>

          {/* Content / body */}
          {/* Conditional on the height on the body, add scrolling class if long  */}
          <div
            className={`update-modal-content ${
              contentHeight > screenHeight * 0.3 ? 'long-scroll' : ''
            }`}
          >
            <div className="update-modal-content-text" ref={setContentDiv}>
              <Content
                modalState={modalState}
                releaseNotes={releaseNotes}
                setModalState={setModalState}
                hasMigratedSharedProject={hasMigratedSharedProject}
              />
            </div>
          </div>
          {/* Buttons */}
          <div className="update-modal-buttons-wrapper">
            <div className="update-modal-button-primary">
              <Button
                onClick={runUpdate}
                icon="arrow-circle-up.svg"
                text={'Update Now'}
              />
            </div>
            <div className="update-modal-button-secondary" onClick={onClose}>
              I'll update later
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default UpdateModal
