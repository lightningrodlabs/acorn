import React from 'react'
import Icon from '../Icon/Icon'

import './ButtonAction.scss'

export type ButtonActionProps = {
  size: 'small' | 'medium' | 'large'
  onClick: () => void
  icon: React.ReactElement
  text: string
}

const ButtonAction: React.FC<ButtonActionProps> = ({
  size = 'medium',
  onClick,
  icon,
  text,
}) => {
  return (
    <div className="button-action-wrapper" onClick={onClick}>
      <div className="button-action-icon">{icon}</div>
      <div className="button-action-text">{text}</div>
    </div>
  )
}

export default ButtonAction
