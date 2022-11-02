// does most of what index.js does but as a component
// export component
// pass in websockets as props

import React, { useState } from 'react'
import { useEffect, useRef } from "react"
import { applyMiddleware, createStore, compose } from "redux"
import { Provider } from 'react-redux'
import App from './routes/App.connector'
import { layoutWatcher } from './redux/ephemeral/layout/middleware'
import { realtimeInfoWatcher } from './redux/persistent/projects/realtime-info-signal/middleware'
import acorn from './redux/reducer'
import signalsHandlers from './signalsHandlers'
import { MAIN_APP_ID, PROFILES_ROLE_ID } from './holochainConfig'
import { getAppWs, setAgentPubKey } from './hcWebsockets'
import { cellIdToString } from './utils'
import { setProfilesCellId, setProjectsCellIds } from './redux/persistent/cells/actions'
import ProfilesZomeApi from './api/profilesApi'
import { fetchAgents } from './redux/persistent/profiles/agents/actions'
import { whoami } from './redux/persistent/profiles/who-am-i/actions'
import { fetchAgentAddress } from './redux/persistent/profiles/agent-address/actions'
import { getProjectCellIdStrings } from './projectAppIds'
import WeProfilesZomeApi from './api/weProfilesApi'


function AppProvided({
    appWs,
    adminWs,
    weServices,
    appletAppInfo,
    isWeApplet
}) {
    const [storeLoaded, setStoreLoaded] = useState(false)
    const middleware = [layoutWatcher, realtimeInfoWatcher]

    // This enables the redux-devtools browser extension
    // which gives really awesome debugging for apps that use redux
    // @ts-ignore
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

    // acorn is the top-level reducer. the second argument is custom Holochain middleware
    let initialStore = createStore(
        acorn,
  /* preloadedState, */ composeEnhancers(applyMiddleware(...middleware))
    )
    const store = useRef(initialStore)

    // initialize the appWs with the signals handler
    const signalCallback = signalsHandlers(store.current)

    useEffect(() => {
        const prepareStore = async () => {
            getAppWs(appWs.client.socket.url, signalCallback).then(async (client) => {
                try {
                    const profilesInfo = isWeApplet ? appletAppInfo.installedAppInfo : await appWs.appInfo({
                        installed_app_id: MAIN_APP_ID,
                    })
                    const { cell_id: cellId } = profilesInfo.cell_data.find(
                        ({ role_id }) => role_id === isWeApplet ? 'we' : PROFILES_ROLE_ID
                    )
                    const [_dnaHash, agentPubKey] = cellId
                    // cache buffer version of agentPubKey
                    setAgentPubKey(agentPubKey)
                    const cellIdString = cellIdToString(cellId)
                    store.current.dispatch(setProfilesCellId(cellIdString))
                    // all functions of the Profiles DNA
                    const profilesZomeApi = isWeApplet ? new WeProfilesZomeApi(appWs, weServices) : new ProfilesZomeApi(appWs)
        
                    const profiles = await profilesZomeApi.profile.fetchAgents(cellId)
                    store.current.dispatch(fetchAgents(cellIdString, profiles))
                    const profile = await profilesZomeApi.profile.whoami(cellId)
                    store.current.dispatch(whoami(cellIdString, profile))
                    const agentAddress = await profilesZomeApi.profile.fetchAgentAddress(cellId)
                    store.current.dispatch(fetchAgentAddress(cellIdString, agentAddress))
        
                    // which projects do we have installed?
                    const projectCellIds = await getProjectCellIdStrings()
                    store.current.dispatch(setProjectsCellIds(projectCellIds))
                    setStoreLoaded(true)
                } catch (e) {
                    console.error(e)
                    return
                }
            })
        }
        prepareStore().catch(console.error)
    }, [])
    
    return (
        <Provider store={store.current}>
            <App isWeApplet={isWeApplet}/>
        </Provider>
    )
}
export default AppProvided;