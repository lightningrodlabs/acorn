import { AppWebsocket, CellId } from '@holochain/client'
import { PROFILES_ZOME_NAME } from '../holochainConfig'
async function callZome(
  appWebsocket: AppWebsocket,
  cellId: CellId,
  fnName: string,
  payload: any // payload
) {
  const provenance = cellId[1]
  return appWebsocket.callZome({
    cell_id: cellId,
    zome_name: PROFILES_ZOME_NAME,
    fn_name: fnName,
    payload: payload,
    cap_secret: null,
    provenance,
  })
}

const ZOME_FN_NAMES = {
    CREATE_WHOAMI: 'create_whoami',
    CREATE_IMPORTED_PROFILE: 'create_imported_profile',
    UPDATE_WHOAMI: 'update_whoami',
    WHOAMI: 'whoami',
    FETCH_AGENTS: 'fetch_agents',
    FETCH_AGENT_ADDRESS: 'fetch_agent_address'
}
export default class ProfilesZomeApi {
  appWebsocket: AppWebsocket
  profile //could be defined as an interface, typescript definition

  // one per entry type that uses hdk_crud
  // projectMeta and members don't use it
  constructor(appWebsocket: AppWebsocket) {
    this.appWebsocket = appWebsocket
    this.profile = {
      createWhoami: async (cellId, payload) => {
        return callZome(appWebsocket, cellId, ZOME_FN_NAMES.CREATE_WHOAMI, payload)
      },
      createImportedProfile: async (cellId, payload) => {
          return callZome(appWebsocket, cellId, ZOME_FN_NAMES.CREATE_IMPORTED_PROFILE, payload)
      },
      updateWhoami: async (cellId, payload) => {
        return callZome(appWebsocket, cellId, ZOME_FN_NAMES.UPDATE_WHOAMI, payload)
      },
      whoami: async (cellId) => {
          return callZome(appWebsocket, cellId, ZOME_FN_NAMES.WHOAMI, null)
      },
      fetchAgents: async (cellId) => {
          return callZome(appWebsocket, cellId, ZOME_FN_NAMES.FETCH_AGENTS, null)
      },
      fetchAgentAddress: async (cellId) => {
          return callZome(appWebsocket, cellId, ZOME_FN_NAMES.FETCH_AGENT_ADDRESS, null)
      }
    }
  }
}
