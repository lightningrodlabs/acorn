import React from 'react'
import Icon from '../Icon/Icon'
import Typography from '../Typography/Typography'
import './GithubLink.scss'

export type GithubLinkProps = {
  githubLink?: string
  onSubmit: () => void
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  inputLinkText: string
  inputLinkTextInvalid?: boolean
  setInputLinkText: (linkText: string) => void
}

const GithubLink: React.FC<GithubLinkProps> = ({
  githubLink,
  onSubmit,
  isEditing,
  setIsEditing,
  inputLinkText,
  inputLinkTextInvalid,
  setInputLinkText,
}) => {
  return (
    <div className="github-link-wrapper">
      <Icon name="github.svg" size="small" className="not-hoverable" />
      {!isEditing && (
        <div className="github-link-display">
          #221
          <div className="github-link-display-external-link">
            <Icon
              name="external-link.svg"
              size="small"
              className="not-hoverable"
            />
          </div>
          {/* Edit button to show on hover */}
          <div className="github-link-edit-button">
            <Icon
              onClick={() => setIsEditing(true)}
              name="edit.svg"
              className="light-grey not-hoverable"
              size="small"
            />
          </div>
        </div>
      )}
      {/* The Github Input */}
      {isEditing && (
        <input
          className={inputLinkTextInvalid ? 'invalid' : ''}
          type="text"
          placeholder="Add a GitHub Issue or pull request link"
          value={inputLinkText}
          onChange={(keyboardEvent) => {
            setInputLinkText(keyboardEvent.target.value)
          }}
          onKeyDown={(keyboardEvent) => {
            // check if this is Enter button
            // if enter button, then call onAdd
            // also validate that there is some text written
            if (keyboardEvent.key === 'Enter' && inputLinkText.length > 0) {
              onSubmit()
              setInputLinkText('')
            }
          }}
        />
      )}
    </div>
  )
}

export default GithubLink
