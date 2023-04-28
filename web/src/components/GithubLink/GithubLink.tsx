import React, { useEffect, useState } from 'react'
import Icon from '../Icon/Icon'
import OnClickOutside from '../OnClickOutside/OnClickOutside'
import './GithubLink.scss'

export type GithubLinkProps = {
  githubLink?: string
  onSubmit: () => void
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  inputLinkText: string
  setInputLinkText: (linkText: string) => void
}

const GithubLink: React.FC<GithubLinkProps> = ({
  githubLink,
  onSubmit,
  isEditing,
  setIsEditing,
  inputLinkText,
  setInputLinkText,
}) => {
  const regex = /\d+/g
  const githubLinkRegex = /https?:\/\/github\.com\/[\w-]+\/[\w-]+\/(issues|pull)\/\d+/i
  const linkNumber = githubLink ? githubLink.match(regex) : null
  const INVALID_LINK_TEXT = 'Invalid link'

  const [isInvalidLink, setIsInvalidLink] = useState(false)

  const validateAndSubmit = () => {
    if (!inputLinkText.trim()) return

    if (!githubLinkRegex.test(inputLinkText.trim())) {
      setIsInvalidLink(true)
      return
    }

    onSubmit()
  }

  useEffect(() => {
    if (inputLinkText !== INVALID_LINK_TEXT) {
      setIsInvalidLink(false)
    }
  }, [inputLinkText])

  useEffect(() => {
    if (isInvalidLink) {
      setInputLinkText(INVALID_LINK_TEXT)
    }
  }, [isInvalidLink])

  return (
    <div className="github-link-wrapper">
      {/* @ts-ignore */}
      <Icon name="github.svg" size="small" className="not-hoverable" />
      {!isEditing && (
        <div className="github-link-display">
          <a href={githubLink} target="_blank">
            #{linkNumber}
            <span className="github-link-display-external-link">
              <Icon
                name="external-link.svg"
                size="small"
                className="not-hoverable"
              />
            </span>
          </a>
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
        <div className="input-with-onlick-outside">
          <OnClickOutside onClickOutside={validateAndSubmit}>
            <input
              className={isInvalidLink ? 'invalid' : ''}
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
                if (keyboardEvent.key === 'Enter') {
                  validateAndSubmit()
                } else if (keyboardEvent.key === 'Escape') {
                  setIsEditing(false)
                  setInputLinkText(githubLink)
                }
              }}
            />
          </OnClickOutside>
        </div>
      )}
    </div>
  )
}

export default GithubLink
