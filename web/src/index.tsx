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

import {
  WeaveClient,
  initializeHotReload,
  isWeContext,
} from '@lightningrodlabs/we-applet'
import createStoreAndRenderToDom, { electronInit } from './indexForElectron'
import {
  getAdminWs,
  getAppWs,
  setAppWs,
  setWeaveClient,
  setWeaveProfilesClient,
} from './hcWebsockets'
import { mossInit } from './indexForMoss'

const isElectron = () => {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.electron != null
  )
}

;(async () => {
  if (!isElectron()) {
    await initializeHotReload()
  }
  if (!isWeContext()) {
    // electron
    ;(async () => {
      const adminWs = await getAdminWs()
      const appWs = await getAppWs()
      const store = await createStoreAndRenderToDom(appWs)
      await electronInit(store, adminWs, appWs)
    })()
  } else {
    ;(async () => {
      const weClient = await WeaveClient.connect()
      setWeaveClient(weClient)
      if (
        weClient.renderInfo.type !== 'applet-view' ||
        weClient.renderInfo.view.type !== 'main'
      )
        throw new Error('This Applet only implements the applet main view.')

      const appClient = weClient.renderInfo.appletClient
      setAppWs(appClient)
      const profilesClient = weClient.renderInfo.profilesClient
      setWeaveProfilesClient(profilesClient)

      const store = await createStoreAndRenderToDom(appClient)
      await mossInit(store, profilesClient, appClient)
    })()
  }
})()
