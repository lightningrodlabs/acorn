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
import { MAIN_APP_ID, PROFILES_ROLE_ID } from './holochainConfig'
import acorn from './redux/reducer'
import signalsHandlers from './signalsHandlers'
import { setProfilesCellId, setProjectsCellIds } from './redux/persistent/cells/actions'
import { layoutWatcher } from './redux/ephemeral/layout/middleware'
import { realtimeInfoWatcher } from './redux/persistent/projects/realtime-info-signal/middleware'
import { fetchAgents } from './redux/persistent/profiles/agents/actions'
import { whoami } from './redux/persistent/profiles/who-am-i/actions'
import { fetchAgentAddress } from './redux/persistent/profiles/agent-address/actions'
import App from './routes/App'
import {
  getAppWs,
  getAdminWs,
  setAgentPubKey,
} from './hcWebsockets'
import { getProjectCellIdStrings } from './projectAppIds'
import ProfilesZomeApi from './api/profilesApi'
import { cellIdToString } from './utils'

// Import styles
import './styles.scss'

// trigger caching of adminWs connection
getAdminWs()

// TODO: remove the holochain middleware
const middleware = [layoutWatcher, realtimeInfoWatcher]

// This enables the redux-devtools browser extension
// which gives really awesome debugging for apps that use redux
// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

// acorn is the top-level reducer. the second argument is custom Holochain middleware
let store = createStore(
  acorn,
  /* preloadedState, */ composeEnhancers(applyMiddleware(...middleware))
)

// initialize the appWs with the signals handler
const signalCallback = signalsHandlers(store)
getAppWs(signalCallback).then(async (client) => {
  try {
    const profilesInfo = await client.appInfo({
      installed_app_id: MAIN_APP_ID,
    })
    const { cell_id: cellId } = profilesInfo.cell_data.find(
      ({ role_id }) => role_id === PROFILES_ROLE_ID
    )
    const [_dnaHash, agentPubKey] = cellId
    // cache buffer version of agentPubKey
    setAgentPubKey(agentPubKey)
    const cellIdString = cellIdToString(cellId)
    store.dispatch(setProfilesCellId(cellIdString))
    // all functions of the Profiles DNA
    const profilesZomeApi = new ProfilesZomeApi(client)

    const profiles = await profilesZomeApi.profile.fetchAgents(cellId)
    store.dispatch(fetchAgents(cellIdString, profiles))
    const profile = await profilesZomeApi.profile.whoami(cellId)
    store.dispatch(whoami(cellIdString, profile))
    const agentAddress = await profilesZomeApi.profile.fetchAgentAddress(cellId)
    store.dispatch(fetchAgentAddress(cellIdString, agentAddress))
    // which projects do we have installed?
    const projectCellIds = await getProjectCellIdStrings()
    store.dispatch(setProjectsCellIds(projectCellIds))
  } catch (e) {
    console.log(e)
    return
  }
})

// By passing the `store` in as a wrapper around our React component
// we make the state available throughout it
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('react')
)
