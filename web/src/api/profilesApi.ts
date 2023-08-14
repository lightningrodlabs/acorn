import { AppWebsocket, CellId } from '@holochain/client'
import { PROFILES_ZOME_NAME } from '../holochainConfig'
import { Profile, WhoAmIOutput } from '../types'
import { AgentPubKeyB64, UpdateInput } from '../types/shared'
import callZome from './callZome'
import { WireRecord } from './hdkCrud'

const ZOME_FN_NAMES = {
  CREATE_WHOAMI: 'create_whoami',
  CREATE_IMPORTED_PROFILE: 'create_imported_profile',
  UPDATE_WHOAMI: 'update_whoami',
  WHOAMI: 'whoami',
  FETCH_AGENTS: 'fetch_agents',
  FETCH_AGENT_ADDRESS: 'fetch_agent_address',
}

const ProfilesApi = (appWebsocket: AppWebsocket) => {
  return {
    createWhoami: async (
      cellId: CellId,
      payload: Profile
    ): Promise<WireRecord<Profile>> => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.CREATE_WHOAMI,
        payload
      )
    },
    createImportedProfile: async (
      cellId: CellId,
      payload: Profile
    ): Promise<WireRecord<Profile>> => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.CREATE_IMPORTED_PROFILE,
        payload
      )
    },
    updateWhoami: async (
      cellId: CellId,
      payload: UpdateInput<Profile>
    ): Promise<WireRecord<Profile>> => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.UPDATE_WHOAMI,
        payload
      )
    },
    whoami: async (cellId: CellId): Promise<WhoAmIOutput> => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.WHOAMI,
        null
      )
    },
    fetchAgents: async (cellId: CellId): Promise<Array<Profile>> => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.FETCH_AGENTS,
        null
      )
    },
    fetchAgentAddress: async (cellId: CellId): Promise<AgentPubKeyB64> => {
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
