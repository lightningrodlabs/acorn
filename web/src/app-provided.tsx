// does most of what index.js does but as a component
// export component
// pass in websockets as props

import React, { useState } from 'react'
import { useEffect, useRef } from "react"
import { applyMiddleware, createStore, compose } from "redux"
import { Provider } from 'react-redux'
import App from './routes/App.connector'
import WeAppletApp from './routes/WeAppletApp.connector'
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
import ProjectsZomeApi from './api/projectsApi'
import { PriorityMode } from './types'
import { simpleCreateProjectMeta } from './redux/persistent/projects/project-meta/actions'

function AppProvided({
    appWs,
    adminWs,
    weServices,
    appletAppInfo,
    isWeApplet
}) {
    const [storeLoaded, setStoreLoaded] = useState(false)
    const middleware = [layoutWatcher, realtimeInfoWatcher]
    // assuming only info about current applet is passed in and that the acorn we applet has only one DNA
    let appletProjectId = isWeApplet ? cellIdToString(appletAppInfo[0].installedAppInfo.cell_data[0].cell_id) : ''
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
                    let agentPubKey
                    let cellId
                    if (!isWeApplet) {
                        const profilesInfo = await appWs.appInfo({
                            installed_app_id: MAIN_APP_ID,
                        })
                        cellId = profilesInfo.cell_data.find(
                            ({ role_id }) => role_id === PROFILES_ROLE_ID
                        ).cell_id
                        agentPubKey = cellId[1]
                    }
                    else {
                        agentPubKey = weServices.profilesStore.myAgentPubKey
                        cellId = appletAppInfo[0].installedAppInfo.cell_data[0].cell_id
                        
                        // TODO get appletProjectId and assign it to the variable
                        // this will have to come from `appletAppInfo` but will need to know how to get the installed_app_id of this specific instance of the applet
                    }
                    // cache buffer version of agentPubKey
                    setAgentPubKey(agentPubKey)
                    const cellIdString = cellIdToString(cellId)
                    // currently for We applet this is being set to the project CellId, not sure how to get the we group cell id without knowing the assigned id
                    store.current.dispatch(setProfilesCellId(cellIdString))
                    // all functions of the Profiles DNA
                    const profilesZomeApi = isWeApplet ? new WeProfilesZomeApi(appWs, weServices) : new ProfilesZomeApi(appWs)
        
                    const profiles = await profilesZomeApi.profile.fetchAgents(cellId)
                    store.current.dispatch(fetchAgents(cellIdString, profiles))
                    const profile = await profilesZomeApi.profile.whoami(cellId)
                    store.current.dispatch(whoami(cellIdString, profile))
                    const agentAddress = await profilesZomeApi.profile.fetchAgentAddress(cellId)
                    console.log('initial fetch of agent address: ', agentAddress)
                    store.current.dispatch(fetchAgentAddress(cellIdString, agentAddress))
        
                    // which projects do we have installed?
                    const projectCellIds = isWeApplet ? [cellIdString] : await getProjectCellIdStrings()
                    store.current.dispatch(setProjectsCellIds(projectCellIds))
                    setStoreLoaded(true)


                    // initialize project meta with default values if an applet
                    if (isWeApplet) {
                        const projectsZomeApi = new ProjectsZomeApi(appWs)
                        const projectMetaExists = await projectsZomeApi.projectMeta.checkProjectMetaExists(cellId)
                        if (!projectMetaExists) {
                            const simpleCreatedProjectMeta = await projectsZomeApi.projectMeta.simpleCreateProjectMeta(cellId, {
                                creatorAgentPubKey: agentAddress,
                                createdAt: Date.now(), // f64
                                name: 'project',
                                image: '',
                                passphrase: 'test',
                                isImported: false,
                                priorityMode: PriorityMode.Universal,
                                topPriorityOutcomes: [],
                            })
                            console.log('created meta', simpleCreatedProjectMeta)
                            store.current.dispatch(simpleCreateProjectMeta(cellIdToString(cellId), simpleCreatedProjectMeta))
                        }
                    }
               } catch (e) {
                    console.error('error at init', e)
                    return
                }
            })
        }
        prepareStore().catch(console.error)
    }, [])
    
    return (
        <Provider store={store.current}>
            <AppRuntimeContext.Provider value={isWeApplet}>
                {isWeApplet && <WeAppletApp appletProjectId={appletProjectId} weServices={weServices} />}
                {!isWeApplet && <App />}
            </AppRuntimeContext.Provider>
        </Provider>
    )
}
export default AppProvided;