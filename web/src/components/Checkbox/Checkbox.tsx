import React from 'react'
import Icon from '../Icon/Icon'

import './Checkbox.scss'

export type CheckboxProps = {
  size: 'small' | 'medium' | 'large'
  isChecked?: boolean
  onChange?: (newState: boolean) => void
}

const Checkbox: React.FC<CheckboxProps> = ({
  size = 'medium',
  isChecked,
  onChange = () => {},
}) => {
  return (
    <div
      onClick={() => onChange(!isChecked)}
      className={`checkbox-wrapper ${isChecked ? 'checked' : ''} 
      ${size === 'small' ? 'small' : size === 'large' ? 'large' : ''}
      `}
    >
      {/* @ts-ignore */}
      {isChecked && <Icon name="check.svg" className="white not-hoverable" />}
    </div>
  )
}

export default Checkbox
