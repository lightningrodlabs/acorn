import React from 'react'
import Checkbox from '../Checkbox/Checkbox'
import Icon from '../Icon/Icon'

import './ButtonCheckbox.scss'

export type ButtonCheckboxProps = {
  size: 'small' | 'medium' | 'large'
  isChecked: boolean
  onChange: (newState: boolean) => void
  icon: React.Component
  text: string
}

const ButtonCheckbox: React.FC<ButtonCheckboxProps> = ({
  size = 'medium',
  isChecked,
  onChange,
  icon,
  text,
}) => {
  return (
    <div
      className={`button-checkbox-wrapper ${isChecked ? 'selected' : ''} `}
      onClick={() => onChange(!isChecked)}
    >
      <div className="button-checkbox-icon-text">
        <div className="button-checkbox-icon">{icon}</div>
        <div className="button-checkbox-text">{text}</div>
      </div>

      <Checkbox size="small" isChecked={isChecked} onChange={onChange} />
    </div>
  )
}

export default ButtonCheckbox
