import { AppWebsocket } from '@holochain/client'
import { PROFILES_ZOME_NAME } from '../holochainConfig'
import callZome from './callZome'

const ZOME_FN_NAMES = {
  CREATE_WHOAMI: 'create_whoami',
  CREATE_IMPORTED_PROFILE: 'create_imported_profile',
  UPDATE_WHOAMI: 'update_whoami',
  WHOAMI: 'whoami',
  FETCH_AGENTS: 'fetch_agents',
  FETCH_AGENT_ADDRESS: 'fetch_agent_address',
}

// TODO: add typescript types

const ProfilesApi = (appWebsocket: AppWebsocket) => {
  return {
    createWhoami: async (cellId, payload) => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.CREATE_WHOAMI,
        payload
      )
    },
    createImportedProfile: async (cellId, payload) => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.CREATE_IMPORTED_PROFILE,
        payload
      )
    },
    updateWhoami: async (cellId, payload) => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.UPDATE_WHOAMI,
        payload
      )
    },
    whoami: async (cellId) => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.WHOAMI,
        null
      )
    },
    fetchAgents: async (cellId) => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.FETCH_AGENTS,
        null
      )
    },
    fetchAgentAddress: async (cellId) => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.FETCH_AGENT_ADDRESS,
        null
      )
    },
  }
}

export default class ProfilesZomeApi {
  appWebsocket: AppWebsocket
  profile: ReturnType<typeof ProfilesApi>
  constructor(appWebsocket: AppWebsocket) {
    this.appWebsocket = appWebsocket
    this.profile = ProfilesApi(appWebsocket)
  }
}
