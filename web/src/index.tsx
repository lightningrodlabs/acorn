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

import { WeaveClient, initializeHotReload, isWeaveContext } from '@theweave/api'
import createStoreAndRenderToDom, { electronInit } from './indexForElectron'
import {
  getAppWs,
  setAppWs,
  setWeaveClient,
  setWeaveProfilesClient,
} from './hcWebsockets'
import { getComponentAndPropsForRenderMode, mossInit } from './indexForMoss'
import { appletServices } from './weave/appletService'
import App from './routes/App.connector' // Import App for main view
import { WeaveClientRenderInfo } from './weave/WeaveClientRenderInfo'

const isWeaveDevMode = () => {
  return process.env.__DEV_MODE__ && !process.env.KANGAROO
}

;(async () => {
  if (isWeaveDevMode()) {
    await initializeHotReload()
  }
  if (!isWeaveContext()) {
    // electron
    ;(async () => {
      const appWs = await getAppWs()
      const store = await createStoreAndRenderToDom(appWs, App)
      await electronInit(store, appWs)
    })()
  } else {
    ;(async () => {
      const weaveClient = await WeaveClient.connect(appletServices)
      setWeaveClient(weaveClient)
      const weaveClientRenderInfo = new WeaveClientRenderInfo(
        weaveClient.renderInfo
      )
      if (!weaveClientRenderInfo.isAppletView()) {
        throw new Error('This Applet only implements the applet view.')
      }

      setAppWs(weaveClientRenderInfo.getAppletClient())
      setWeaveProfilesClient(weaveClientRenderInfo.getProfilesClient())

      const rootElementAndProps = getComponentAndPropsForRenderMode(
        weaveClientRenderInfo
      )
      let store: any

      store = await createStoreAndRenderToDom(
        weaveClientRenderInfo.getAppletClient(),
        rootElementAndProps.rootElement,
        rootElementAndProps.rootProps
      )
      await mossInit(
        store,
        weaveClientRenderInfo.getProfilesClient(),
        weaveClientRenderInfo.getAppletClient()
      )
    })()
  }
})()
