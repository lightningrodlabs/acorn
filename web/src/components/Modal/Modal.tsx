import React from 'react'
import { CSSTransition } from 'react-transition-group'

import Icon from '../Icon/Icon'
import Button from '../Button/Button'
import Typography from '../Typography/Typography'

import './Modal.scss'

/* Named Export */

export type ModalContentProps = {
  content: string | JSX.Element,
  secondaryContent?: string,
  heading: string,
  icon?: string,
  primaryButton: string,
  primaryButtonAction: () => void,
  altButton?: string,
  altButtonAction?: () => void,
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
      <div className="modal-header">
        {icon && (
          <span className="modal-icon">
            <Icon name={icon} className="not-hoverable" />
          </span>
        )}
        <div className="modal-heading">
          <Typography style="h2">{heading}</Typography>
        </div>
      </div>
      <div className="modal-content-wrapper">
        <div className="modal-content">
          <Typography style="body1">{content}</Typography>
        </div>
        {secondaryContent ? secondaryContent : null}
      </div>
      <div className="modal-footer">
        {/* TODO: enable "don't show me again" (persist to Holochain or localStorage) */}
        {/* <div className='dont-show-again-option'>
            <input type='checkbox' id='checkbox-dont-show-again' />
            <label htmlFor='checkbox-dont-show-again'>Don't show me again</label>
          </div> */}
        <div className="buttons-wrapper">
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
  white?: boolean,
  active: boolean,
  className?: string,
  onClose: () => void,
}

const Modal: React.FC<ModalProps> = ({ white, active, className, onClose, children }) => {
  return (
    <CSSTransition in={active} timeout={100} unmountOnExit classNames="modal">
      <div className={`modal ${white ? 'modal-white' : ''}`}>
        {/* TODO: figure out how to implement onclickoutside */}
        {/* without imapcting the styling for the modal */}
        {/* problem seen on Profile Setting after implementation */}
        {/* <OnClickOutside onClickOutside={onClose}> */}
        <div className={`${className} modal-wrapper`}>
          {onClose && (
            <Icon
              name="x.svg"
              size="small-close"
              className="light-grey"
              onClick={() => onClose()}
            />
          )}
          {children}
        </div>
        {/* </OnClickOutside> */}
      </div>
    </CSSTransition>
  )
}

export default Modal
