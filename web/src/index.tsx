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

import { WeaveClient, isWeContext } from '@lightningrodlabs/we-applet'
import createStoreAndRenderToDom, { electronInit } from './indexForElectron'
import { getAdminWs, getAppWs } from './hcWebsockets'

console.log('HELLLLLLO')

if (!isWeContext()) {
  // electron
  ;(async () => {
    const adminWs = await getAdminWs()
    const appWs = await getAppWs()
    const store = await createStoreAndRenderToDom(appWs)
    await electronInit(store, adminWs, appWs)
  })()
} else {
  console.log('hello2')
  ;(async () => {
    console.log('hello3')
    const weClient = await WeaveClient.connect()
    console.log('hello4')
    if (
      weClient.renderInfo.type !== 'applet-view' ||
      weClient.renderInfo.view.type !== 'main'
    )
      throw new Error('This Applet only implements the applet main view.')

    const appClient = weClient.renderInfo.appletClient
    const profilesClient = weClient.renderInfo.profilesClient

    console.log('made it here')
    const store = await createStoreAndRenderToDom(appClient)
    console.log('made it here2')
  })()
}
