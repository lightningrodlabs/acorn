import { AdminWebsocket, AppWebsocket, AppClient } from '@holochain/client'
import { MAIN_APP_ID } from './holochainConfig'
import { isWeContext, WeaveClient } from '@lightningrodlabs/we-applet'
import { ProfilesClient } from '@holochain-open-dev/profiles'

// export for use by holochainMiddleware (redux)

// @ts-ignore
export const APP_WS_URL = new URL(`ws://localhost:${__APP_PORT__}`)

// @ts-ignore
const ADMIN_WS_URL = new URL(`ws://localhost:${__ADMIN_PORT__}`)

let appWs: AppClient
let appWsPromise: Promise<AppClient>
let adminWs: AdminWebsocket
let agentPubKey
let weaveProfilesClient: ProfilesClient
let weaveClient: WeaveClient

export async function getAdminWs(): Promise<AdminWebsocket> {
  if (adminWs) {
    return adminWs
  } else {
    adminWs = await AdminWebsocket.connect({ url: ADMIN_WS_URL })
    // keepalive
    setInterval(() => {
      if (adminWs.client.socket.readyState === adminWs.client.socket.OPEN) {
        adminWs.listDnas()
      }
    }, 60000)
    adminWs.client.socket.addEventListener('close', () => {
      console.log('admin websocket closed')
    })
    return adminWs
  }
}

export async function getAppWs(): Promise<AppClient> {
  async function connect() {
    // undefined is for default request timeout
    const response = await adminWs.issueAppAuthenticationToken({
      installed_app_id: MAIN_APP_ID,
    })
    appWsPromise = AppWebsocket.connect({
      token: response.token,
      url: APP_WS_URL,
    })
    appWs = await appWsPromise
    appWsPromise = null
    ;(appWs as AppWebsocket).client.socket.addEventListener(
      'close',
      async () => {
        console.log('app websocket closed, trying to re-open')
        await connect()
        console.log('app websocket reconnected')
      }
    )
  }

  if (
    appWs &&
    (appWs as AppWebsocket).client.socket.readyState ===
      (appWs as AppWebsocket).client.socket.OPEN
  ) {
    return appWs
  } else if (isWeContext()) {
    const weClient = await WeaveClient.connect()
    if (
      weClient.renderInfo.type !== 'applet-view' ||
      weClient.renderInfo.view.type !== 'main'
    )
      throw new Error('This Applet only implements the applet main view.')
    const appClient = weClient.renderInfo.appletClient
    appWs = appClient
    return appWs
  } else if (appWsPromise) {
    // connection must have been lost
    // wait for it to re-open
    return await appWsPromise
  } else if (!adminWs) {
    await getAdminWs()
    await connect()
    return appWs
  } else if (!appWs) {
    // this branch should only be called ONCE
    // on the very first call to this function
    await connect()
    // set up logic for auto-reconnection
    setInterval(async () => {
      if (
        (appWs as AppWebsocket).client.socket.readyState ===
        (appWs as AppWebsocket).client.socket.OPEN
      ) {
        // random call just to keep the connection open
        appWs.appInfo()
      } else if (
        (appWs as AppWebsocket).client.socket.readyState ===
        (appWs as AppWebsocket).client.socket.CLOSED
      ) {
        // try to reconnect
        await connect()
        console.log('app websocket reconnected')
      }
    }, 60000)
    return appWs
  }
}

export function setAdminWs(setAs: AdminWebsocket) {
  adminWs = setAs
}
export function setAppWs(setAs: AppClient) {
  appWs = setAs
}

export function getAgentPubKey() {
  return agentPubKey
}

export function setAgentPubKey(setAs) {
  agentPubKey = setAs
}

export function setWeaveClient(client: WeaveClient) {
  weaveClient = client
}
export function setWeaveProfilesClient(profilesClient: ProfilesClient) {
  weaveProfilesClient = profilesClient
}
export async function getWeaveProfilesClient() {
  if (!isWeContext()) {
    throw new Error('Not in Weave context')
  } else if (weaveProfilesClient) {
    return weaveProfilesClient
  } else {
    const weaveClient = await (async () => {
      if (weaveClient) return weaveClient
      return await WeaveClient.connect()
    })()
    if (
      weaveClient.renderInfo.type !== 'applet-view' ||
      weaveClient.renderInfo.view.type !== 'main'
    )
      throw new Error('This Applet only implements the applet main view.')
    weaveProfilesClient = weaveClient.renderInfo.profilesClient
    return weaveProfilesClient
  }
}
