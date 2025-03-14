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
import { mossInit } from './indexForMoss'

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
      console.log('electron')
      const appWs = await getAppWs()
      const store = await createStoreAndRenderToDom(appWs)
      console.log('admin, appws', appWs)
      await electronInit(store, appWs)
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
