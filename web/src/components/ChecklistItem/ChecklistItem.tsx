import React from 'react'
import Checkbox from '../Checkbox/Checkbox'

import './ChecklistItem.scss'

export type ChecklistItemProps = {
  size: 'small' | 'medium' | 'large'
  task: string
  complete: boolean
  onChangeComplete: (complete: boolean) => void
  // onChangeTask: (task: string) => void
  // textEditable?: boolean
  withStrikethrough?: boolean
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  size = 'medium',
  task,
  complete,
  onChangeComplete,
  // onChangeTask,
  // textEditable,
  withStrikethrough,
}) => {
  return (
    <div
      className={`checklist-item-wrapper ${
        withStrikethrough ? 'with-strikethrough' : ''
      }
    ${size === 'small' ? 'small' : size === 'large' ? 'large' : ''}`}
    >
      <Checkbox size={size} isChecked={complete} onChange={onChangeComplete} />
      <div
        className={`checklist-item-wrapper-text ${complete ? 'checked' : ''}
        ${size === 'small' ? 'small' : size === 'large' ? 'large' : ''}`}
      >
        {/* TODO: make this text optionally editable */}
        {/* textEditable */}
        {/* onChangeText */}
        {task}
      </div>
    </div>
  )
}

export default ChecklistItem
