import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import { AppClient, encodeHashToBase64 } from '@holochain/client'

// Local Imports
import acorn from './redux/reducer'
import signalsHandlers from './signalsHandlers'
import { setProjectsCellIds } from './redux/persistent/cells/actions'
import { layoutWatcher } from './redux/ephemeral/layout/middleware'
import { realtimeInfoWatcher } from './redux/persistent/projects/realtime-info-signal/middleware'
import { setAgentAddress } from './redux/persistent/profiles/agent-address/actions'
// Remove direct import of App, it will be passed in: import App from './routes/App.connector'
import { setAgentPubKey } from './hcWebsockets'
import { getProjectCellIdStrings } from './projectAppIds'
import ProfilesZomeApi from './api/profilesApi'
import { cellIdFromString, readMyLocalProfile } from './utils'

// Import styles
import './variables.scss'
import './global.scss'
import { fetchProjectProfiles, setProjectWhoami } from './redux/persistent/projects/members/actions'
import { setMyLocalProfile } from './redux/persistent/profiles/my-local-profile/actions'

// Update function signature to accept RootComponent and rootProps
export default async function createStoreAndRenderToDom(
  appWs: AppClient,
  RootComponent: React.ElementType,
  rootProps: Record<string, any> = {}
) {
  const middleware = [layoutWatcher, realtimeInfoWatcher(appWs)]
  // This enables the redux-devtools browser extension
  // which gives really awesome debugging for apps that use redux
  const composeEnhancers =
    // @ts-ignore
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  // acorn is the top-level reducer. the second argument is custom Holochain middleware
  let store = createStore(
    acorn,
    /* preloadedState, */ composeEnhancers(applyMiddleware(...middleware))
  )
  // connect the signal handler to the app websocket
  appWs.on('signal', signalsHandlers(store))

  // By passing the `store` in as a wrapper around our React component
  // we make the state available throughout it
  // Render the passed RootComponent with its props
  ReactDOM.render(
    <Provider store={store}>
      <RootComponent {...rootProps} />
    </Provider>,
    document.getElementById('react')
  )

  return store
}

export async function electronInit(store: any, appWs: AppClient) {
  try {
    const appInfo = await appWs.appInfo()
    console.log('indexing electron A', {
      appWs,
      appInfo,
    })

    // cache buffer version of agentPubKey
    setAgentPubKey(appInfo.agent_pub_key)

    // read the local profile from localStorage and set it in the state
    const myLocalProfile = readMyLocalProfile()
    store.dispatch(setMyLocalProfile(myLocalProfile))

    // fetch the profiles for all projects
    const projectCellIds = await getProjectCellIdStrings(appInfo)
    store.dispatch(setProjectsCellIds(projectCellIds))
    await Promise.all(
      projectCellIds.map(async (cellIdString) => {
        const profilesZomeApi = new ProfilesZomeApi(
          appWs,
          cellIdFromString(cellIdString)
        )
        const profiles = await profilesZomeApi.profile.fetchAgents()
        store.dispatch(fetchProjectProfiles(cellIdString, profiles))
        const whoami = await profilesZomeApi.profile.whoami()
        store.dispatch(setProjectWhoami(cellIdString, whoami))
      })
    )

    store.dispatch(setAgentAddress(encodeHashToBase64(appInfo.agent_pub_key)))

  } catch (e) {
    console.error(e)
  }
}
