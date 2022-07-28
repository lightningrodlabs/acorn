import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Checkbox from '../Checkbox/Checkbox'
import ChecklistItem from '../ChecklistItem/ChecklistItem'

import Icon from '../Icon/Icon'

import './Checklist.scss'

export type ChecklistItemType = {
  task: string
  complete: boolean
}

export type ChecklistProps = {
  size: 'small' | 'medium' | 'large'
  listItems: ChecklistItemType[]
  onChange: (index: number, task: string, complete: boolean) => Promise<void>
  onAdd: (newTask: string) => Promise<void>
  onRemove: (index: number) => Promise<void>
}

const Checklist: React.FC<ChecklistProps> = ({
  size = 'medium',
  listItems,
  onChange,
  onAdd,
  onRemove,
}) => {
  // internal state is just
  // to track the keyboard input for the 'new checklist item'
  const [typingText, setTypingText] = useState('')
  console.log('typingText', typingText.length)
  return (
    <div className="checklist-wrapper">
      {listItems.map((listItem, index) => (
        <div className="checklist-item-row">
          <ChecklistItem
            withStrikethrough
            size={size}
            task={listItem.task}
            complete={listItem.complete}
            onChangeComplete={(isChecked) =>
              onChange(index, listItem.task, isChecked)
            }
            onChangeTask={(text) => onChange(index, text, listItem.complete)}
          />
          {/* Remove button */}
          <div
            className="checklist-remove-button-wrapper"
            onClick={() => onRemove(index)}
          >
            {/* @ts-ignore */}
            <Icon
              name="delete-bin.svg"
              size="small"
              className="light-grey"
              withTooltip
              tooltipText="Remove"
            />
          </div>
        </div>
      ))}
      {/* Add a Checklist Item input */}
      <div
        className={`add-checklist-item-wrapper
        ${size === 'small' ? 'small' : size === 'large' ? 'large' : ''}`}
      >
        <Checkbox size={size} />

        <TextareaAutosize
          value={typingText}
          placeholder="Add a checklist Item"
          onChange={(keyboardEvent) => {
            setTypingText(keyboardEvent.target.value)
          }}
          onKeyUp={(keyboardEvent) => {
            // check if this is Enter button
            // if enter button, then call onAdd
            // also validate that there is some text written
            if (keyboardEvent.key === 'Enter' && typingText.length > 0) {
              onAdd(typingText)
              setTypingText('')
            }
          }}
        />
  
      </div>
    </div>
  )
}

export default Checklist
