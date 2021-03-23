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
import { holochainMiddleware } from 'connoropolous-hc-redux-middleware'
import { cellIdToString } from 'connoropolous-hc-redux-middleware/build/main/lib/actionCreator'

// Local Imports
import { PROFILES_APP_ID, PROFILES_DNA_NAME } from './holochainConfig'
import acorn from './reducer'
import signalsHandlers from './signalsHandlers'
import { setProfilesCellId, setProjectsCellIds } from './cells/actions'
import { fetchAgents } from './agents/actions'
import { whoami } from './who-am-i/actions'
import { fetchAgentAddress } from './agent-address/actions'
import App from './routes/App'
import {
  getAppWs,
  getAdminWs,
  setAgentPubKey,
  APP_WS_URL,
} from './hcWebsockets'
import { getProjectCellIdStrings } from './projectAppIds'

// trigger caching of adminWs connection
getAdminWs()

const middleware = [holochainMiddleware(APP_WS_URL)]

// This enables the redux-devtools browser extension
// which gives really awesome debugging for apps that use redux
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

// acorn is the top-level reducer. the second argument is custom Holochain middleware
let store = createStore(
  acorn,
  /* preloadedState, */ composeEnhancers(applyMiddleware(...middleware))
)

// initialize the appWs with the signals handler
getAppWs(signalsHandlers(store)).then(async client => {
  const profilesInfo = await client.appInfo({
    installed_app_id: PROFILES_APP_ID,
  })
  const [cellId, _] = profilesInfo.cell_data.find(
    ([_cellId, dnaName]) => dnaName === PROFILES_DNA_NAME
  )
  const [_dnaHash, agentPubKey] = cellId
  // cache buffer version of agentPubKey
  setAgentPubKey(agentPubKey)
  const cellIdString = cellIdToString(cellId)
  store.dispatch(setProfilesCellId(cellIdString))
  // all functions of the Profiles DNA
  store.dispatch(fetchAgents.create({ cellIdString, payload: null }))
  store.dispatch(whoami.create({ cellIdString, payload: null }))
  store.dispatch(fetchAgentAddress.create({ cellIdString, payload: null }))
  // which projects do we have installed?
  const projectCellIds = await getProjectCellIdStrings()
  store.dispatch(setProjectsCellIds(projectCellIds))
})

// By passing the `store` in as a wrapper around our React component
// we make the state available throughout it
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('react')
)
