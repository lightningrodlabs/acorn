import React, { useEffect, useState } from 'react'
import './RunUpdate.scss'

function RunUpdate({ preRestart, version }) {
  // if not preRestart, then this is postRestart

  const title = preRestart ? 'Preparing your update' : 'Finishing your update'
  const [status, setStatus] = useState('')

  console.log(version)
  
  useEffect(() => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.send('start-update-download', version)
      ipcRenderer.once('finished-update-download', () => {
        console.log('finished downloading update')
      })
      if (preRestart) {
        setStatus('Exporting your data. The app will restart shortly.')
      } else {
        setStatus('Importing your data.')
      }
    } else {
      setStatus('Not in an electron app, cant run update')
    }
  }, [])

  /* 0 = 0, 45 = 90, 90 = 135, 135 = 180 */
  /* transform: rotate(45deg); */
  const [progress, setProgress] = useState(0) // percent
  const deg = Math.round((progress / 100) * 180)
  const progressCss = {
    transform: `rotate(${deg}deg)`,
  }

  return (
    <div className='run-update-screen-wrapper'>
      <div className='run-update-screen'>
        <div className='circle-wrap'>
          <div className='circle'>
            <div className='mask full' style={progressCss}>
              <div className='fill' style={progressCss}></div>
            </div>
            <div className='mask half'>
              <div className='fill' style={progressCss}></div>
            </div>
            <div className='inside-circle'>
              <img src='img/acorn-logo.svg' />
            </div>
          </div>
        </div>

        <div className='run-update-screen-heading'>{title}</div>
        <div className='run-update-screen-subheading'>
          {status}
        </div>
      </div>
    </div>
  )
}

export default RunUpdate
