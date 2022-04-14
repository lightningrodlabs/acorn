import React from 'react'
import Checkbox from '../Checkbox/Checkbox'

import './ChecklistItem.scss'

export type ChecklistItemProps = {
  size: 'small' | 'medium' | 'large'
  text: string
  isChecked: boolean
  onChangeCheck: (isChecked: boolean) => void
  onChangeText: (text: string) => void
  textEditable?: boolean
  withStrikethrough?: boolean
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  size = 'medium',
  text,
  isChecked,
  onChangeCheck,
  onChangeText,
  textEditable,
  withStrikethrough,
}) => {
  return (
    <div
      className={`checklist-item-wrapper ${
        withStrikethrough ? 'with-strikethrough' : ''
      }
    ${size === 'small' ? 'small' : size === 'large' ? 'large' : ''}`}
    >
      <Checkbox
        size={size}
        isChecked={isChecked}
        onChange={onChangeCheck}
      />
      <div
        className={`checklist-item-wrapper-text ${isChecked ? 'checked' : ''}
        ${size === 'small' ? 'small' : size === 'large' ? 'large' : ''}`}
      >
        {/* TODO: make this text optionally editable */}
        {/* textEditable */}
        {/* onChangeText */}
        {text}
      </div>
    </div>
  )
}

export default ChecklistItem
