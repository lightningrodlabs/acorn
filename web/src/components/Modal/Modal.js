import React from 'react'
import { CSSTransition } from 'react-transition-group'

import Icon from '../Icon/Icon'
import Button from '../Button/Button'

import './Modal.scss'
import OnClickOutside from '../OnClickOutside/OnClickOutside'

function ModalContent({
  content,
  secondaryContent,
  heading,
  icon,
  primaryButton,
  primaryButtonAction,
  altButton,
  altButtonAction,
}) {
  return (
    <>
      <div className="modal-header">
        {icon && (
          <span className="modal-icon">
            <Icon name={icon} className="not-hoverable" />
          </span>
        )}
        <div className="modal-heading">{heading}</div>
      </div>
      <div className="modal-content-wrapper">
        <div className="modal-content">{content}</div>
        {secondaryContent ? secondaryContent : null}
      </div>
      <div className="modal-footer">
        {/* TODO: enable "don't show me again" (persist to Holochain or localStorage) */}
        {/* <div className='dont-show-again-option'>
            <input type='checkbox' id='checkbox-dont-show-again' />
            <label htmlFor='checkbox-dont-show-again'>Don't show me again</label>
          </div> */}
        <div className="buttons-wrapper">
          <div className="btn-stroked">
            {altButton && (
              <Button
                text={altButton}
                onClick={altButtonAction}
                stroke
                size="large"
              />
            )}
          </div>
          <div className="btn-filled">
            <Button
              text={primaryButton}
              onClick={primaryButtonAction}
              size="large"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export { ModalContent }

export default function Modal({ white, active, className, onClose, children }) {
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
