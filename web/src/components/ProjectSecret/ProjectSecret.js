import React, { useState } from 'react'
import './ProjectSecret.scss'
import Icon from '../Icon/Icon'
import ValidatingFormInput from '../ValidatingFormInput/ValidatingFormInput'

export default function ProjectSecret({ passphrase }) {
  // Copied to clipboard message validation for project invitation secret

  const copyMessage = 'Secret copied to clipboard'

  const [showCopyMessage, setShowCopyMessage] = useState(false)

  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(passphrase)
    setShowCopyMessage(true)
  }

  return (
    <div className='project-secret-wrapper'>
      <div className='project-secret-row'>
        <ValidatingFormInput
          value={passphrase}
          label='Project Invitation Secret'
          helpText='Share this secret phrase with people you want to invite to this project.'
        />
        <div
          onClick={copySecretToClipboard}
          className='project-secret-copy-secret'>
          <Icon
            withTooltip
            size='small'
            tooltipText='Copy'
            name='file-copy.svg'
          />
        </div>
      </div>
      {showCopyMessage && (
        <div className='secret-copy-message'>{copyMessage}</div>
      )}
    </div>
  )
}
