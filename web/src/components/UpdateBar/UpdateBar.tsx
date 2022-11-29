import React from 'react'
import { CSSTransition } from 'react-transition-group'

import './UpdateBar.scss'

import ButtonClose from '../ButtonClose/ButtonClose'

export type UpdateBarProps = {
  active: boolean
  onClose?: () => void
  onClickPrimaryAction: () => void
  onClickSecondaryAction: () => void
  text: string
  buttonPrimaryText: string
  buttonSecondaryText?: string
  migratedSharedProjectText?: string
}

const UpdateBar: React.FC<UpdateBarProps> = ({
  active,
  onClose,
  onClickPrimaryAction,
  onClickSecondaryAction,
  text,
  buttonPrimaryText,
  buttonSecondaryText,
  migratedSharedProjectText,
}) => {
  return (
    <CSSTransition
      in={active}
      timeout={400}
      unmountOnExit
      classNames="update-bar"
    >
      <div className="update-bar-wrapper">
        <div className="update-bar-text-wrapper">
          {text}
          {migratedSharedProjectText}
        </div>

        <div className="update-bar-action-buttons">
          {/* secondary action button / changelog */}
          <a
            className="update-bar-action-button-secondary"
            onClick={onClickSecondaryAction}
          >
            {buttonSecondaryText}
          </a>

          {/* primary action button / update now */}
          <a
            className="update-bar-action-button-primary"
            onClick={onClickPrimaryAction}
          >
            {buttonPrimaryText}
          </a>
        </div>
        {!migratedSharedProjectText && (
          <div className="update-bar-close">
            <ButtonClose onClick={onClose} size="small" />
          </div>
        )}
      </div>
    </CSSTransition>
  )
}

export default UpdateBar
