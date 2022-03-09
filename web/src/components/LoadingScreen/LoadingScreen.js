import React from 'react'
import './LoadingScreen.scss'

function LoadingScreen() {
  return (
    <div className='loading_screen_wrapper'>
      <div className='loading_screen'>
        <img src='img/acorn-logo.svg' />
        <div>collecting your acorns...</div>
      </div>
    </div>
  )
}

export default LoadingScreen
