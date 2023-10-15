import React from 'react'
import './SyncingIndicator.scss'
import Icon from '../Icon/Icon'
import Tooltip from '../Tooltip/Tooltip'

export type SyncingIndicatorProps = {
  small?: boolean
}

const SyncingIndicator: React.FC<SyncingIndicatorProps> = ({ small }) => {
  return (
    <div className="syncing-indicator">
      <Tooltip text="Syncing project data" top />
      {!small && (
        <Icon name="refresh.svg" className="not-hoverable" size="medium" />
      )}
      {small && (
        <Icon name="refresh.svg" className="not-hoverable" size="small" />
      )}
    </div>
  )
}

export default SyncingIndicator
