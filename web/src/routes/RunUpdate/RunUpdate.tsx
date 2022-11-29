import React, { useEffect, useState } from 'react'

import './RunUpdate.scss'

// @ts-ignore
import AcornLogo from '../../images/acorn-logo.svg'
import ProgressIndicator from '../../components/ProgressIndicator/ProgressIndicator'
import Typography from '../../components/Typography/Typography'

export type RunUpdateProps = {
  preRestart?: boolean
  version?: string
}

const RunUpdate: React.FC<RunUpdateProps> = ({ preRestart, version }) => {
  // if not preRestart, then this is postRestart

  const title = preRestart ? 'Preparing your update' : 'Finishing your update'
  const [status, setStatus] = useState('')

  // on component mount, initiate
  useEffect(() => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron')
      if (preRestart) {
        ipcRenderer.send('initiateUpdate')
        ipcRenderer.once('updateDownloaded', () => {
          console.log('finished downloading update')
        })
        setStatus('Exporting your data. The app will restart shortly.')
      } else {
        setStatus('Importing your data.')
      }
    } else {
      setStatus('Not in an electron app, cant run update')
    }
  }, [preRestart])

  /* 0 = 0, 45 = 90, 90 = 135, 135 = 180 */
  /* transform: rotate(45deg); */
  const [progress, setProgress] = useState(0) // percent
  const deg = Math.round((progress / 100) * 180)
  const progressCss = {
    transform: `rotate(${deg}deg)`,
  }

  return (
    <div className="run-update-screen-wrapper">
      <div className="run-update-screen">
        <div className="run-update-circle-with-logo">
          <div className="run-update-circle">
            <ProgressIndicator progress={66} />
          </div>
          <div className="run-update-rotating-logo">
            <img src={AcornLogo} />
          </div>
        </div>
        <div className="run-update-screen-heading"><Typography style={'h3'}>{title}</Typography></div>
        <div className="run-update-screen-subheading"><Typography style={'body1'}>{status}</Typography></div>
      </div>
    </div>
  )
}

export default RunUpdate
