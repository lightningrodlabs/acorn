import React from 'react'
import { CSSTransition } from 'react-transition-group'

import Icon from '../Icon/Icon'
import Button from '../Button/Button'
import Typography from '../Typography/Typography'

import './Modal.scss'
import ButtonClose from '../ButtonClose/ButtonClose'

/* Named Export */

export type ModalContentProps = {
  content: string | JSX.Element
  secondaryContent?: string
  heading: string
  icon?: string
  primaryButton: string
  primaryButtonAction: () => void
  altButton?: string
  altButtonAction?: () => void
}

const ModalContent: React.FC<ModalContentProps> = ({
  content,
  secondaryContent,
  heading,
  icon,
  primaryButton,
  primaryButtonAction,
  altButton,
  altButtonAction,
}) => {
  return (
    <>
      {/* Modal Heading and Icon */}
      <div className="modal-heading-with-icon-wrapper">
        {icon && (
          <div className="modal-icon">
            <Icon name={icon} className="not-hoverable" />
          </div>
        )}
        <div className="modal-heading">
          <Typography style="heading-modal">{heading}</Typography>
        </div>
      </div>
      {/* Modal Content */}
      <div className="modal-content-wrapper">
        <div className="modal-content">
          <Typography style="body-modal">{content}</Typography>
        </div>
        {secondaryContent ? secondaryContent : null}
      </div>
      <div className="modal-footer">
        {/* TODO: enable "don't show me again" (persist to Holochain or localStorage) */}
        {/* <div className='dont-show-again-option'>
            <input type='checkbox' id='checkbox-dont-show-again' />
            <label htmlFor='checkbox-dont-show-again'>Don't show me again</label>
          </div> */}
        <div
          className={`modal-buttons-wrapper ${
            !altButton ? 'has-one-button' : ''
          }`}
        >
          <div>
            {altButton && (
              <Button
                text={altButton}
                onClick={altButtonAction}
                size="medium"
              />
            )}
          </div>
          <div>
            <Button
              text={primaryButton}
              onClick={primaryButtonAction}
              size="medium"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export { ModalContent }

/* Default Export */

export type ModalProps = {
  white?: boolean
  active: boolean
  className?: string
  onClose?: () => void
}

const Modal: React.FC<ModalProps> = ({
  white,
  active,
  className,
  onClose,
  children,
}) => {
  return (
    <CSSTransition in={active} timeout={100} unmountOnExit classNames="modal">
      <div className={`modal ${white ? 'modal-white' : ''}`}>
        {/* TODO: figure out how to implement onclickoutside */}
        {/* without imapcting the styling for the modal */}
        {/* problem seen on Profile Setting after implementation */}
        {/* <OnClickOutside onClickOutside={onClose}> */}
        <div className={`${className} modal-wrapper`}>
          {onClose && (
            <div className="modal-button-close">
              <ButtonClose onClick={onClose} size="medium" />
            </div>
          )}
          <div className='modal-scrollable-content'>
          {children}
          </div>
        </div>
        {/* </OnClickOutside> */}
      </div>
    </CSSTransition>
  )
}

export default Modal
