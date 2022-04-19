import React from 'react'

import './LoadingScreen.scss'

import AcornLogo from '../../images/acorn-logo.svg'

function LoadingScreen() {
  return (
    <div className='loading_screen_wrapper'>
      <div className='loading_screen'>
        <img src={AcornLogo} />
        <div>collecting your acorns...</div>
      </div>
    </div>
  )
}

export default LoadingScreen
