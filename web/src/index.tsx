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

import { WeClient, isWeContext, initializeHotReload } from '@lightningrodlabs/we-applet'
import createStoreAndRenderToDom, { electronInit } from './indexForElectron'
import { getAdminWs, getAppWs, setAppWs } from './hcWebsockets'

console.log('HELLLLLLO')

if (!isWeContext) {
  // electron
  ;(async () => {
    const appWs = await getAppWs()
    const adminWs = await getAdminWs()
    const store = await createStoreAndRenderToDom(appWs)
    await electronInit(store, adminWs, appWs)
  })()
} else {
  console.log('hello2')
  ;(async () => {
    await initializeHotReload();
    console.log('hello3')
    const weClient = await WeClient.connect()
    console.log('hello4')
    if (
      weClient.renderInfo.type !== 'applet-view' ||
      weClient.renderInfo.view.type !== 'main'
    )
      throw new Error('This Applet only implements the applet main view.')

    const appAgentClient = weClient.renderInfo.appletClient
    const profilesClient = weClient.renderInfo.profilesClient

    setAppWs(appAgentClient)
    console.log('made it here')
    const store = await createStoreAndRenderToDom(appAgentClient)
    console.log('made it here2')
  })()
}
