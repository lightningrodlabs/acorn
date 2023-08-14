import React from 'react'
import Button from '../Button/Button'
import Modal, { ModalContent } from '../Modal/Modal'
import Typography from '../Typography/Typography'
import './ConnectivityOverlay.scss'

export type ConnectivityOverlayProps = {
  // proptypes
  heading: string
  content: string
  buttonText: string
  onClick: () => void
}

const ConnectivityOverlay: React.FC<ConnectivityOverlayProps> = ({
  // prop declarations
  heading,
  content,
  buttonText,
  onClick,
}) => {
  return (
    <div className="connectivity-overlay-wrapper">
      <Modal active={true}>
        {/* Heading */}
        <div className="connectivity-modal-heading">
          <Typography style={'heading-modal'}>{heading}</Typography>
        </div>

        {/* Content / body */}
        {/* Conditional on the height on the body, add scrolling class if long  */}
        <div className="connectivity-modal-content">
          <div className="connectivity-modal-content-text">
            <Typography style={'body-modal'}>{content}</Typography>
          </div>
        </div>
        <div className="connectivity-modal-buttons-wrapper">
          <div className="connectivity-modal-button-primary">
            <Button icon="refresh.svg" text={buttonText} onClick={onClick} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ConnectivityOverlay
