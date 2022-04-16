import React from 'react'
import Icon from '../Icon/Icon'

import './ButtonAction.scss'

export type ButtonActionProps = {
  size: 'small' | 'medium' | 'large'
  onClick: () => void
  icon: React.Component
  text: string
}

const ButtonAction: React.FC<ButtonActionProps> = ({
  size = 'medium',
  onClick,
  icon,
  text,
}) => {
  return (
    <div
      className={`button-action-wrapper ${
        size === 'small' ? 'small' : size === 'large' ? 'large' : ''
      }`}
      onClick={onClick}
    >
      <div className="button-action-icon">{icon}</div>
      <div className="button-action-text">{text}</div>
    </div>
  )
}

export default ButtonAction
