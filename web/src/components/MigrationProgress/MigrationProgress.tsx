import React from 'react'
import './MigrationProgress.scss'
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator'
import Typography from '../Typography/Typography'
// @ts-ignore
import AcornLogo from '../../images/acorn-logo.svg'

export type MigrationProgressProps = {
  title: string
  status: string | React.ReactElement
  progress: number
  actionButtons?: React.ReactElement
}

const MigrationProgress: React.FC<MigrationProgressProps> = ({
  title,
  status,
  progress,
  actionButtons,
}) => {
  return (
    <div className="run-update-screen-wrapper">
      <div className="run-update-screen">
        <div className="run-update-circle-with-logo">
          <div className="run-update-circle">
            <ProgressIndicator progress={progress} />
          </div>
          <div className="run-update-rotating-logo">
            <img src={AcornLogo} />
          </div>
        </div>
        <div className="run-update-screen-heading">
          <Typography style={'h3'}>{title}</Typography>
        </div>
        <div className="run-update-screen-subheading">
          <Typography style={'body1'}>{status}</Typography>
          {actionButtons ? actionButtons : null}
        </div>
      </div>
    </div>
  )
}

export default MigrationProgress
