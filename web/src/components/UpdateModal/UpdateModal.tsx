import React, { useEffect, useState } from 'react'
import Modal from '../Modal/Modal'
import './UpdateModal.scss'

import { useHistory } from 'react-router-dom'
import Button from '../Button/Button'
import Typography from '../Typography/Typography'
import Tag from '../Tag/Tag'

export enum ViewingReleaseNotes {
  ReleaseNotes,
  MainMessage,
}

export type UpdateModalProps = {
  // proptypes
  show: boolean
  onClose: () => void
  releaseTag: string
  releaseSize?: string
  heading: string
  content: React.ReactElement
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  show,
  onClose,
  releaseTag,
  releaseSize,
  heading,
  content,
}) => {
  const history = useHistory()
  const runUpdate = () => {
    history.push('/run-update')
  }

  // These are for dynamic calculatio of content height and screen height
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
            <div
              className="update-modal-content-text"
              ref={(contentDiv) => {
                if (contentDiv && !contentHeight)
                  setContentHeight(contentDiv.clientHeight)
              }}
            >
              <Typography style={'body-modal'}>{content}</Typography>
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
