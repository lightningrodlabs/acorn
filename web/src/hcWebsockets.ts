import {
  AdminWebsocket,
  AppAgentWebsocket,
  AppAgentClient,
} from '@holochain/client'
import { MAIN_APP_ID } from './holochainConfig'

// export for use by holochainMiddleware (redux)

// @ts-ignore
export const APP_WS_URL = new URL(`ws://localhost:${__APP_PORT__}`)

// @ts-ignore
const ADMIN_WS_URL = new URL(`ws://localhost:${__ADMIN_PORT__}`)

let appWs: AppAgentClient
let appWsPromise: Promise<AppAgentClient>
let adminWs: AdminWebsocket
let agentPubKey

export async function getAdminWs(): Promise<AdminWebsocket> {
  if (adminWs) {
    return adminWs
  } else {
    adminWs = await AdminWebsocket.connect(ADMIN_WS_URL)
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

export async function getAppWs(): Promise<AppAgentClient> {
  async function connect() {
    // undefined is for default request timeout
    appWsPromise = AppAgentWebsocket.connect(APP_WS_URL, MAIN_APP_ID)
    appWs = await appWsPromise
    appWsPromise = null
    ;(appWs as AppAgentWebsocket).appWebsocket.client.socket.addEventListener(
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
    (appWs as AppAgentWebsocket).appWebsocket.client.socket.readyState ===
      (appWs as AppAgentWebsocket).appWebsocket.client.socket.OPEN
  ) {
    return appWs
  } else if (appWsPromise) {
    // connection must have been lost
    // wait for it to re-open
    return await appWsPromise
  } else if (!appWs) {
    // this branch should only be called ONCE
    // on the very first call to this function
    await connect()
    // set up logic for auto-reconnection
    setInterval(async () => {
      if (
        (appWs as AppAgentWebsocket).appWebsocket.client.socket.readyState ===
        (appWs as AppAgentWebsocket).appWebsocket.client.socket.OPEN
      ) {
        // random call just to keep the connection open
        appWs.appInfo()
      } else if (
        (appWs as AppAgentWebsocket).appWebsocket.client.socket.readyState ===
        (appWs as AppAgentWebsocket).appWebsocket.client.socket.CLOSED
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
export function setAppWs(setAs: AppAgentClient) {
  appWs = setAs
}

export function getAgentPubKey() {
  return agentPubKey
}

export function setAgentPubKey(setAs) {
  agentPubKey = setAs
}
