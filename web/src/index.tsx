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

import { WeClient, isWeContext } from '@lightningrodlabs/we-applet'
import main from './indexForElectron'

if (!isWeContext) {
  // electron
  main()
} else {
  ;(async () => {
    const weClient = await WeClient.connect()
    if (
      weClient.renderInfo.type !== 'applet-view' ||
      weClient.renderInfo.view.type !== 'main'
    )
      throw new Error('This Applet only implements the applet main view.')

    const appAgentClient = weClient.renderInfo.appletClient
    const profilesClient = weClient.renderInfo.profilesClient

    console.log('made it here')
  })()
}
