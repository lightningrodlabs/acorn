import React from 'react'
import Icon from '../Icon/Icon'

import './ProgressIndicator.scss'
import ProgressRing from './ProgressRing'

export type ProgressIndicatorProps = {
  progress: number // between 0 and 100 inclusive
  size?: 'small' | 'medium'
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  size = 'medium',
}) => {
  return (
    // Note: uncertain scope does not have progress indicator symbol
    // intead it has a uncertain scope symbol (red circle with question mark)

    <div
      className={`progress-indicator-wrapper ${
        size === 'small' ? 'small' : ''
      }`}
    >
      {/* {progress.toString()} */}

      {/* if not achieved  */}
      {/* Symbol: yellow dashed circle */}
      {progress === 0 && (
        <Icon
          name="circle-dashed.svg"
          size="small"
          className="not-hoverable not-achieved"
        />
      )}

      {/* if partially achieved */}
      {/* Symbol: grey circle border with dynamic progree percentage */}
      {progress > 0 && progress < 100 && (
        // size for progress ring is in rem
        <ProgressRing strokeWidth={4.5} size={16} progress={progress} />
      )}

      {/* if fully achieved */}
      {/* Symbol: green circle with checkmark */}
      {progress === 100 && (
        <Icon
          name="circle-check.svg"
          size="small"
          className="not-hoverable achieved"
        />
      )}
    </div>
  )
}

export default ProgressIndicator
