import React from 'react'
import './ProgressIndicator.scss'

export type ProgressIndicatorProps = {
  progress: number // between 0 and 100 inclusive
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress
}) => {
  return <div>
    {progress.toString()}
  </div>
}

export default ProgressIndicator
