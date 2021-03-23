import { AdminWebsocket, AppWebsocket } from '@holochain/conductor-api'

// export for use by holochainMiddleware (redux)
export const APP_WS_URL = `ws://localhost:${__APP_PORT__}`
const ADMIN_WS_URL = `ws://localhost:${__ADMIN_PORT__}`

let appWs
let adminWs
let agentPubKey

export async function getAdminWs() {
  if (adminWs) {
    return adminWs
  } else {
    adminWs = await AdminWebsocket.connect(ADMIN_WS_URL)
    return adminWs
  }
}

export async function getAppWs(signalsHandler) {
  if (appWs) {
    return appWs
  } else {
    appWs = await AppWebsocket.connect(APP_WS_URL, signalsHandler)
    return appWs
  }
}

export function getAgentPubKey() {
  return agentPubKey
}

export function setAgentPubKey(setAs) {
  agentPubKey = setAs
}
