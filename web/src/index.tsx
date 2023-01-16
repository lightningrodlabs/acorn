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
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'

// Local Imports
import { MAIN_APP_ID, PROFILES_ROLE_NAME } from './holochainConfig'
import acorn from './redux/reducer'
import signalsHandlers from './signalsHandlers'
import {
  setProfilesCellId,
  setProjectsCellIds,
} from './redux/persistent/cells/actions'
import { layoutWatcher } from './redux/ephemeral/layout/middleware'
import { realtimeInfoWatcher } from './redux/persistent/projects/realtime-info-signal/middleware'
import { fetchAgents } from './redux/persistent/profiles/agents/actions'
import { whoami } from './redux/persistent/profiles/who-am-i/actions'
import { fetchAgentAddress } from './redux/persistent/profiles/agent-address/actions'
import App from './routes/App.connector'
import { getAppWs, getAdminWs, setAgentPubKey } from './hcWebsockets'
import { getProjectCellIdStrings } from './projectAppIds'
import ProfilesZomeApi from './api/profilesApi'
import { cellIdFromString, cellIdToString } from './utils'
import AppProvided from './app-provided'

// Import styles
import './variables.scss'
import './global.scss'

Promise.all([
  getAdminWs(), 
  getAppWs(),

]).then(([
  adminWs, 
  appWs,
]) => {
  ReactDOM.render(
    <AppProvided 
      appWs={appWs} 
      adminWs={adminWs}
      weStore={null}
      isWeApplet={false}
      appletInfo={null}
    />,
    document.getElementById('react')
  )
})