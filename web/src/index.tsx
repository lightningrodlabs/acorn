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
import { appletServices } from './weave/appletService'
import App from './routes/App.connector' // Import App for main view
import ConnectedExpandedViewMode from './components/ExpandedViewMode/ExpandedViewMode.connector' // Import EVM for asset view
import { Hrl, CellId } from '@holochain/client'
import { cellIdToString, actionHashToString } from './utils'
import { PROJECTS_ROLE_NAME } from './holochainConfig'

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
      const weaveClient = await WeaveClient.connect(appletServices)
      setWeaveClient(weaveClient)
      if (
        weaveClient.renderInfo.type !== 'applet-view' ||
        weaveClient.renderInfo.view.type !== 'main'
      )
        throw new Error('This Applet only implements the applet main view.')

      const appClient = weaveClient.renderInfo.appletClient
      setAppWs(appClient)
      const profilesClient = weaveClient.renderInfo.profilesClient
      setWeaveProfilesClient(profilesClient)

      let store: any
      if (weaveClient.renderInfo.view.type === 'asset') {
        // Asset View: Render ExpandedViewMode
        const hrl: Hrl = weaveClient.renderInfo.view.hrl
        const dnaHash = hrl[0]
        const actionHash = hrl[1]

        // Find the cellId for the project based on DnaHash
        const appInfo = await appClient.appInfo()
        const projectsCells = appInfo.cell_info[PROJECTS_ROLE_NAME]
        const cellInfo = projectsCells.find(
          (info) =>
            CellType.Provisioned in info &&
            info[CellType.Provisioned].cell_id[0].toString() ===
              dnaHash.toString()
        )

        if (!cellInfo || !(CellType.Provisioned in cellInfo)) {
          throw new Error(
            `Could not find provisioned cell for DNA hash: ${dnaHash}`
          )
        }
        const cellId: CellId = cellInfo[CellType.Provisioned].cell_id
        const projectId = cellIdToString(cellId)
        const outcomeActionHash = actionHashToString(actionHash)

        const rootProps = {
          initialProjectId: projectId,
          initialOutcomeActionHash: outcomeActionHash,
        }
        store = await createStoreAndRenderToDom(
          appClient,
          ConnectedExpandedViewMode,
          rootProps
        )
      } else if (weaveClient.renderInfo.view.type === 'main') {
        // Main View: Render App
        store = await createStoreAndRenderToDom(appClient, App)
      } else {
        throw new Error(
          `Unsupported Weave view type: ${weaveClient.renderInfo.view.type}`
        )
      }

      // Initialize profiles and other common data regardless of view
      await mossInit(store, profilesClient, appClient)
    })()
  }
})()
