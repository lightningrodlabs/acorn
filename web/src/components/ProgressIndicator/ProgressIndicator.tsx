import React from 'react'
import Icon from '../Icon/Icon'

import './ProgressIndicator.scss'
import ProgressRing from './ProgressRing'

export type ProgressIndicatorProps = {
  progress: number // between 0 and 100 inclusive
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ progress }) => {
  return (
    // Note: uncertain scope does not have progress indicator symbol
    // intead it has a uncertain scope symbol (red circle with question mark)

    <div className="progress-indicator-wrapper">
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
      {progress > 0 && progress < 100 && <ProgressRing progress={progress} />}
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
