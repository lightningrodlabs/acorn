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

// Import styles
import './variables.scss'
import './global.scss'
import { CellType } from '@holochain/client'

// trigger caching of adminWs connection
getAdminWs()

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

getAppWs().then(async (client) => {
  // connect the signal handler to the app websocket
  client.on('signal', signalsHandlers(store))
  try {
    const profilesInfo = await client.appInfo({
      installed_app_id: MAIN_APP_ID,
    })

    const cellInfo = profilesInfo.cell_info[PROFILES_ROLE_NAME][0]
    const cellId = (CellType.Provisioned in cellInfo) ? cellInfo[CellType.Provisioned].cell_id : undefined
    if (cellId == undefined) {
      throw 'cellId undefined'
    }
    else {
      // authorize zome call signer
      const adminWs = await getAdminWs()
      await adminWs.authorizeSigningCredentials(cellId)
      
  
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
      // this allows us to 'reclaim' a profile that was imported by someone else that is ours
      // (i.e. it relates to our public key)
      if (profile) {
        let nonImportedProfile = {
          ...profile.entry,
          isImported: false,
        }
        await profilesZomeApi.profile.updateWhoami(cellId, {
          entry: nonImportedProfile,
          actionHash: profile.actionHash,
        })
        profile.entry = nonImportedProfile
      }
      store.dispatch(whoami(cellIdString, profile))
      const agentAddress = await profilesZomeApi.profile.fetchAgentAddress(cellId)
      store.dispatch(fetchAgentAddress(cellIdString, agentAddress))
      // which projects do we have installed?
      const projectCellIds = await getProjectCellIdStrings()
      
      // before any zome calls can be made, we need to gain zome call signing authorization
      // for each of the project cells that we have installed
      await Promise.all(projectCellIds.map(async (cellId) => {
        await adminWs.authorizeSigningCredentials(cellIdFromString(cellId))
      }))
      store.dispatch(setProjectsCellIds(projectCellIds))
    }
  } catch (e) {
    console.error(e)
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
