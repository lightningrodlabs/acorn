import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Icon from '../Icon/Icon'
import './AddOutcomeChildInput.scss'

export type AddOutcomeChildInputProps = {
  // proptypes
  onCreateChildOutcome: (newOutcomeText: string) => Promise<void>
}

const AddOutcomeChildInput: React.FC<AddOutcomeChildInputProps> = ({
  // prop declarations
  onCreateChildOutcome,
}) => {
  // internal state is just
  // to track the keyboard input for the 'add new child'
  const [typingText, setTypingText] = useState('')

  return (
    <div className='add-outcome-child-wrapper'>
      <div>
        <Icon name="plus.svg" size='small' className='light-grey not-hoverable'/>
      </div>
      <TextareaAutosize
        value={typingText}
        placeholder="Create a new Child by typing Outcome Statement then hitting Enter"
        onChange={(keyboardEvent) => {
          setTypingText(keyboardEvent.target.value)
        }}
        onKeyUp={(keyboardEvent) => {
          // check if this is Enter button
          // if enter button, then call onAdd
          // also validate that there is some text written
          if (keyboardEvent.key === 'Enter' && typingText.length > 0) {
            onCreateChildOutcome(typingText)
            setTypingText('')
          }
        }}
      />
    </div>
  )
}

export default AddOutcomeChildInput
