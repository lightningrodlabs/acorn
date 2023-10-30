import React, { useContext} from 'react'
import './ProjectSecret.scss'
import Icon from '../Icon/Icon'
import ValidatingFormInput from '../ValidatingFormInput/ValidatingFormInput'
import ToastContext, { ShowToast } from '../../context/ToastContext'

export default function ProjectSecret({ passphrase }) {
  // pull in the toast context
  const { setToastState } = useContext(ToastContext)

  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(passphrase)
    setToastState({
      id: ShowToast.Yes,
      text: 'Project secret copied to clipboard',
      type: 'confirmation',
    })
  }

  return (
    <div className="project-secret-wrapper">
      <div className="project-secret-row">
        {/* @ts-ignore */}
        <ValidatingFormInput
          value={passphrase}
          label="Project Invitation Secret"
          helpText="Share this secret phrase with people you want to invite to this project."
        />
        {/* copy to clipboard button */}
        <div
          onClick={copySecretToClipboard}
          className="project-secret-copy-secret"
        >
          <Icon
            withTooltip
            size="small"
            tooltipText="Copy"
            name="file-copy.svg"
          />
        </div>
      </div>
    </div>
  )
}
