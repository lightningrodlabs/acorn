import { AdminWebsocket, AppWebsocket, AppClient } from '@holochain/client'
import { isWeaveContext, WeaveClient } from '@theweave/api'
import { ProfilesClient } from '@holochain-open-dev/profiles'

let appWs: AppClient
let agentPubKey
let weaveProfilesClient: ProfilesClient
let weaveClient: WeaveClient

export async function getAppWs(): Promise<AppClient> {
  if (appWs) return appWs
  appWs = await AppWebsocket.connect()
  return appWs
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
  if (!isWeaveContext()) {
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
