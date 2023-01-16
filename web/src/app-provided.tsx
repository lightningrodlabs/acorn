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
import { APPLET_ROLE_NAME, MAIN_APP_ID, PROFILES_ROLE_NAME } from './holochainConfig'
import { getAppWs, setAgentPubKey } from './hcWebsockets'
import { cellIdFromString, cellIdToString } from './utils'
import { setProfilesCellId, setProjectsCellIds } from './redux/persistent/cells/actions'
import ProfilesZomeApi from './api/profilesApi'
import { fetchAgents, setAgent } from './redux/persistent/profiles/agents/actions'
import { whoami } from './redux/persistent/profiles/who-am-i/actions'
import { fetchAgentAddress } from './redux/persistent/profiles/agent-address/actions'
import { getProjectCellIdStrings } from './projectAppIds'
import WeProfilesZomeApi from './api/weProfilesApi'
import ProjectsZomeApi from './api/projectsApi'
import { simpleCreateProjectMeta } from './redux/persistent/projects/project-meta/actions'
import { AppletInfo, WeServices } from '@lightningrodlabs/we-applet'
import { AdminWebsocket, AppWebsocket, CellId } from '@holochain/client'

function AppProvided({
    appWs,
    adminWs,
    weStore,
    appletInfo,
    isWeApplet
}: {
    appWs: AppWebsocket,
    adminWs: AdminWebsocket,
    weStore: WeServices,
    appletInfo: AppletInfo[],
    isWeApplet: boolean,

}) {
    const [storeLoaded, setStoreLoaded] = useState(false)
    const middleware = [layoutWatcher, realtimeInfoWatcher]
    // assuming only info about current applet is passed in and that the acorn we applet has only one DNA
    // let appletProjectId = isWeApplet ? cellIdToString(appletInfo[0].appInfo.cell_info[APPLET_ROLE_NAME][0]) : ''
    let appletProjectId
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
                // connect the signal handler to the app websocket
                client.on('signal', signalCallback)
                try {
                    let agentPubKey
                    let cellId: CellId | undefined
                    if (!isWeApplet) {
                        const profilesInfo = await client.appInfo({
                        installed_app_id: MAIN_APP_ID,
                        })
                        const cellInfo = profilesInfo.cell_info[PROFILES_ROLE_NAME][0]
                        cellId = ("Provisioned" in cellInfo) ? cellInfo.Provisioned.cell_id : undefined
                        agentPubKey = cellId[1]
                    }
                    else {
                        agentPubKey = weStore.profilesStore.myAgentPubKey
                        const cellInfo = appletInfo[0].appInfo.cell_info[APPLET_ROLE_NAME][0]
                        cellId = ("Provisioned" in cellInfo) ? cellInfo.Provisioned.cell_id : undefined
                        appletProjectId = cellIdToString(cellId)
                    }
                    setAgentPubKey(agentPubKey)
                    if (cellId == undefined) {
                    throw 'cellId undefined'
                    }
                    else {
                    // authorize zome call signer
                    await adminWs.authorizeSigningCredentials(cellId)
                    
                
                    const [_dnaHash, agentPubKey] = cellId
                    // cache buffer version of agentPubKey
                    setAgentPubKey(agentPubKey)
                    const cellIdString = cellIdToString(cellId)
                    store.current.dispatch(setProfilesCellId(cellIdString))
                    // all functions of the Profiles DNA
                    const profilesZomeApi = isWeApplet ? new WeProfilesZomeApi(client, weStore) : new ProfilesZomeApi(client)
                
                    const profiles = await profilesZomeApi.profile.fetchAgents(cellId)
                    store.current.dispatch(fetchAgents(cellIdString, profiles))
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
                    store.current.dispatch(whoami(cellIdString, profile))
                    const agentAddress = await profilesZomeApi.profile.fetchAgentAddress(cellId)
                    store.current.dispatch(fetchAgentAddress(cellIdString, agentAddress))
                    // which projects do we have installed?
                    const projectCellIds = isWeApplet ? [cellIdString] : await getProjectCellIdStrings()
                    
                    // before any zome calls can be made, we need to gain zome call signing authorization
                    // for each of the project cells that we have installed
                    await Promise.all(projectCellIds.map(async (cellId) => {
                        await adminWs.authorizeSigningCredentials(cellIdFromString(cellId))
                    }))
                    store.current.dispatch(setProjectsCellIds(projectCellIds))
                    setStoreLoaded(true)

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
                                topPriorityOutcomes: [],
                                isMigrated: null,
                            })
                            console.log('created meta', simpleCreatedProjectMeta)
                            store.current.dispatch(simpleCreateProjectMeta(cellIdToString(cellId), simpleCreatedProjectMeta))
                        }
                    }
                    }
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
            {isWeApplet && <App appletProjectId={appletProjectId} weServices={weStore} />}
            {!isWeApplet && <App />}
        </Provider>
    )
}
export default AppProvided;