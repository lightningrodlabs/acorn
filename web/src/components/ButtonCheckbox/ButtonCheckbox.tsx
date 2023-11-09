import React, { useEffect, useState } from 'react'
import Checkbox from '../Checkbox/Checkbox'

import './ButtonCheckbox.scss'

export type ButtonCheckboxProps = {
  size: 'tiny' | 'small' | 'medium' | 'large'
  isChecked: boolean
  onChange: (newState: boolean) => void
  icon: React.ReactElement
  text: string
}

const ButtonCheckbox: React.FC<ButtonCheckboxProps> = ({
  size = 'medium',
  isChecked,
  onChange,
  icon,
  text,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  useEffect(() => {
    // listen for Enter key to be pressed, but
    // ignore if Command/Ctrl is also pressed
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.metaKey) {
        onChange(!isChecked)
      }
    }
    if (isFocused) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      if (isFocused) {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isFocused, isChecked, onChange])
  return (
    <div
      role="button"
      tabIndex={0}
      className={`button-checkbox-wrapper ${isChecked ? 'selected' : ''} ${
        size === 'tiny'
          ? 'tiny'
          : size === 'small'
          ? 'small'
          : size === 'large'
          ? 'large'
          : ''
      }`}
      onClick={() => onChange(!isChecked)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
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
