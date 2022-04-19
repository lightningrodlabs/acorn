import React from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Icon from '../Icon/Icon'
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
    <div className="input-comment-row">
      <div className="input-comment-wrapper">
        <TextareaAutosize
          type="text"
          value={value}
          placeholder="Write your comment here"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="comment-save-button">
          <Icon
            name="send-plane.svg"
            className="medium light-grey"
            onClick={submitComment}
          />
        </div>
      </div>
    </div>
  )
}

export default CommentInput
