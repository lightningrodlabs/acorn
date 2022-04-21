import React from 'react'
import Typography from '../Typography/Typography'

import './ReadOnlyInfo.scss'

export type ReadOnlyInfoProps = {
  size?: 'small' | 'medium' | 'large'
  infos: { icon: React.ReactElement; text: string }[]
}

const ReadOnlyInfo: React.FC<ReadOnlyInfoProps> = ({
  size = 'medium',
  infos,
}) => {
  return (
    <div
      className={`read-only-info-wrapper ${
        size === 'small' ? 'small' : size === 'large' ? 'large' : ''
      }`}
    >
      {infos.map((info) => {
        return (
          <div className="read-only-info-row">
            <div className="read-only-info-icon">{info.icon}</div>
            <div className="read-only-info-text">
              <Typography style="body2">{info.text}</Typography>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ReadOnlyInfo
