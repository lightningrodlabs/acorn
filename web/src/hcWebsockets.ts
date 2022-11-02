import { AppWebsocket, AdminWebsocket } from '@holochain/client'

// export for use by holochainMiddleware (redux)
// @ts-ignore
export const APP_WS_URL = `ws://localhost:${__APP_PORT__}`
// @ts-ignore
const ADMIN_WS_URL = `ws://localhost:${__ADMIN_PORT__}`

let appWs: AppWebsocket
let appWsPromise: Promise<AppWebsocket>
let adminWs: AdminWebsocket
let agentPubKey

export async function getAdminWs(): Promise<AdminWebsocket> {
  if (adminWs) {
    return adminWs
  } else {
    adminWs = await AdminWebsocket.connect(ADMIN_WS_URL)
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

export async function getAppWs(appWsUrl?: string, signalsHandler?: any): Promise<AppWebsocket> {
  async function connect() {
    // undefined is for default request timeout
    appWsPromise = AppWebsocket.connect(appWsUrl ? appWsUrl : APP_WS_URL, undefined, signalsHandler)
    appWs = await appWsPromise
    appWsPromise = null
    appWs.client.socket.addEventListener('close', async () => {
      console.log('app websocket closed, trying to re-open')
      await connect()
      console.log('app websocket reconnected')
    })
  }

  // if socket is already connected, return the open app Websocket
  if (appWs && appWs.client.socket.readyState === appWs.client.socket.OPEN) {
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
      if (appWs.client.socket.readyState === appWs.client.socket.OPEN) {
        // random call just to keep the connection open
        appWs.appInfo({
          installed_app_id: 'test',
        })
      } else if (
        appWs.client.socket.readyState === appWs.client.socket.CLOSED
      ) {
        // try to reconnect
        await connect()
        console.log('app websocket reconnected')
      }
    }, 60000)
    return appWs
  }
}

export function getAgentPubKey() {
  return agentPubKey
}

export function setAgentPubKey(setAs) {
  agentPubKey = setAs
}
