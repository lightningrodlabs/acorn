/*
  This file is ENTRY POINT to the entire web application.
  Only code that gets called at some point from this file (via imports or otherwise)
  will get executed in the browser window.
  Try to keep it clean and minimal in this file, and outsource aspects to more
  modular code in separate files, imported here and called.
*/

// Library Imports
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import React from 'react'
import ReactDOM from 'react-dom'
import {
  getAppWs,
  getAdminWs,
} from './hcWebsockets'
import AppProvided from './app-provided'

// Import styles
import './variables.scss'
import './global.scss'

Promise.all([
  getAdminWs(), 
  getAppWs(),

]).then(([
  adminWs, 
  appWs
]) => {
  ReactDOM.render(
    <AppProvided 
      appWs={appWs} 
      adminWs={adminWs}
    />,
    document.getElementById('react')
  )
})
