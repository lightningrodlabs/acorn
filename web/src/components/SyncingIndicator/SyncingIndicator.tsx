import React from 'react'
import './SyncingIndicator.scss'
import Icon from '../Icon/Icon'
import Tooltip from '../Tooltip/Tooltip'

export type SyncingIndicatorProps = {}

const SyncingIndicator: React.FC<SyncingIndicatorProps> = ({}) => {
  return (
    <div className="syncing-indicator">
      <Tooltip text="Syncing project data" top />
      <Icon name="refresh.svg" className="not-hoverable" size="medium" />
    </div>
  )
}

export default SyncingIndicator
