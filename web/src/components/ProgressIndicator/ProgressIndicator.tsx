import React from 'react'
import Icon from '../Icon/Icon'
import './ProgressIndicator.scss'

export type ProgressIndicatorProps = {
  progress: number // between 0 and 100 inclusive
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ progress }) => {
  return (
    <div className="progress-indicator-wrapper">
      {/* {progress.toString()} */}
      {/* if not achieved */}
      {progress === 0 && <Icon name="circle-dashed.svg" size="small" />}
      {/* if partially achieved (excludes uncertain scope) */}
      {progress > 0 && progress < 0 && (
        // TODO: render dynamic progress circle here
        <Icon name="circle-dashed.svg" size="small" />
      )}
      {/* if fully achieved (excludes uncertain scope) */}
      {progress === 100 && <Icon name="circle-check.svg" size="small" />}
    </div>
  )
}

export default ProgressIndicator
