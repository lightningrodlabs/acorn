import React from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Icon from '../Icon/Icon'
import Typography from '../Typography/Typography'
import './CommentInput.scss'

export type CommentInputProps = {
  value: string
  setValue: (value: string) => void
  onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>
  submitComment: () => void
}

const CommentInput: React.FC<CommentInputProps> = ({
  value,
  setValue,
  onKeyDown,
  submitComment,
}) => {
  return (
    <div className="comment-input-row">
      <div className="comment-input-wrapper">
        <TextareaAutosize
          type="text"
          value={value}
          placeholder="Add a comment"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="comment-input-enter-button">
          <Icon
            name="send-plane.svg"
            className="small grey"
            onClick={submitComment}
            withTooltip
            tooltipText="⌘ + ↩"
          />
        </div>
      </div>
    </div>
  )
}

export default CommentInput
