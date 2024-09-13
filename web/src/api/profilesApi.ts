import {
  AgentPubKey,
  AppClient,
  CellId,
  encodeHashToBase64,
} from '@holochain/client'
import { PROFILES_ZOME_NAME } from '../holochainConfig'
import { Profile, WhoAmIOutput } from '../types'
import { AgentPubKeyB64, UpdateInput } from '../types/shared'
import callZome from './callZome'
import { WireRecord } from './hdkCrud'
import {
  ProfilesClient,
  Profile as WeaveProfile,
} from '@holochain-open-dev/profiles'
import ProfileSchema from 'zod-models/dist/profile/profileSchema'
import { Status } from '../components/Header/Status'
import { EntryRecord } from '@holochain-open-dev/utils'

const ZOME_FN_NAMES = {
  CREATE_WHOAMI: 'create_whoami',
  CREATE_IMPORTED_PROFILE: 'create_imported_profile',
  UPDATE_WHOAMI: 'update_whoami',
  WHOAMI: 'whoami',
  FETCH_AGENTS: 'fetch_agents',
  FETCH_AGENT_ADDRESS: 'fetch_agent_address',
}
interface IProfilesApi {
  createWhoami: (
    cellId: CellId,
    payload: Profile
  ) => Promise<WireRecord<Profile>>
  createImportedProfile: (
    cellId: CellId,
    payload: Profile
  ) => Promise<WireRecord<Profile>>
  updateWhoami: (
    cellId: CellId,
    payload: UpdateInput<Profile>
  ) => Promise<WireRecord<Profile>>
  whoami: (cellId: CellId) => Promise<WhoAmIOutput>
  fetchAgents: (cellId: CellId) => Promise<Array<Profile>>
  fetchAgentAddress: (cellId: CellId) => Promise<AgentPubKeyB64>
}

const ProfilesApi = (appWebsocket: AppClient): IProfilesApi => {
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
  appWebsocket: AppClient
  profile: IProfilesApi
  constructor(appWebsocket: AppClient, profilesClient?: ProfilesClient) {
    this.appWebsocket = appWebsocket
    this.profile = profilesClient
      ? WeaveProfilesApi(profilesClient)
      : ProfilesApi(appWebsocket)
  }
}

const schemaShape = ProfileSchema.shape

const acornFields = Object.keys(schemaShape)

function weaveToAcornProfile(
  weaveProfile: WeaveProfile,
  agentPubKey: string
): Profile {
  let acornProfile = {}

  // field each acorn profile field, check if it exists in the weave Profile, if it does, use that, if not, use defaults
  acornFields.forEach((key) => {
    if (key === 'isImported') {
      // default to false, unless field exists, then parse into bool from string
      acornProfile[key] = weaveProfile.fields[key]
        ? JSON.parse(weaveProfile.fields[key])
        : false
    } else if (key === 'status') {
      // default to offline until the fields exists
      acornProfile[key] = weaveProfile.fields[key]
        ? (weaveProfile.fields[key] as Status)
        : ('Offline' as Status)
    } else if (key === 'agentPubKey') {
      acornProfile[key] = weaveProfile.fields[key]
        ? weaveProfile.fields[key]
        : agentPubKey
    } else if (key === 'avatarUrl') {
      acornProfile[key] = weaveProfile.fields[key]
        ? JSON.parse(weaveProfile.fields[key])
        : ''
    } else {
      // if no first and last name and handle are given, use the nickname
      acornProfile[key] = weaveProfile.fields[key]
        ? weaveProfile.fields[key]
        : weaveProfile.nickname
    }
  })
  return acornProfile as Profile
}
function acornToWeaveProfile(
  acornProfile: Profile,
  weaveProfile: WeaveProfile
): WeaveProfile {
  Object.keys(acornProfile).forEach((key) => {
    if (key === 'isImported') {
      weaveProfile.fields[key] = JSON.stringify(acornProfile[key])
    } else {
      weaveProfile.fields[key] = acornProfile[key]
    }
  })
  return weaveProfile
}
const WeaveProfilesApi = (profilesClient: ProfilesClient): IProfilesApi => {
  const myPubKey = profilesClient.client.myPubKey
  return {
    createWhoami: async (
      cellId: CellId,
      payload: Profile
    ): Promise<WireRecord<Profile>> => {
      let myWeaveProfile = await profilesClient.getAgentProfile(myPubKey)
      const profile = acornToWeaveProfile(payload, myWeaveProfile.entry)
      const updatedProfileRecord = await profilesClient.updateProfile(profile)
      return {
        actionHash: encodeHashToBase64(updatedProfileRecord.actionHash),
        entryHash: encodeHashToBase64(updatedProfileRecord.entryHash),
        entry: weaveToAcornProfile(
          updatedProfileRecord.entry,
          encodeHashToBase64(myPubKey)
        ),
        createdAt: updatedProfileRecord.action.timestamp,
        updatedAt: updatedProfileRecord.action.timestamp,
      }
    },
    createImportedProfile: async (
      cellId: CellId,
      payload: Profile
    ): Promise<WireRecord<Profile>> => {
      let myWeaveProfile = await profilesClient.getAgentProfile(myPubKey)
      const profile = acornToWeaveProfile(payload, myWeaveProfile.entry)
      const updatedProfileRecord = await profilesClient.updateProfile(profile)
      return {
        actionHash: encodeHashToBase64(updatedProfileRecord.actionHash),
        entryHash: encodeHashToBase64(updatedProfileRecord.entryHash),
        entry: weaveToAcornProfile(
          updatedProfileRecord.entry,
          encodeHashToBase64(myPubKey)
        ),
        createdAt: updatedProfileRecord.action.timestamp,
        updatedAt: updatedProfileRecord.action.timestamp,
      }
    },
    updateWhoami: async (
      cellId: CellId,
      payload: UpdateInput<Profile>
    ): Promise<WireRecord<Profile>> => {
      let myWeaveProfile = await profilesClient.getAgentProfile(myPubKey)
      const profile = acornToWeaveProfile(payload.entry, myWeaveProfile.entry)
      const updatedProfileRecord = await profilesClient.updateProfile(profile)
      return {
        actionHash: encodeHashToBase64(updatedProfileRecord.actionHash),
        entryHash: encodeHashToBase64(updatedProfileRecord.entryHash),
        entry: weaveToAcornProfile(
          updatedProfileRecord.entry,
          encodeHashToBase64(myPubKey)
        ),
        createdAt: updatedProfileRecord.action.timestamp,
        updatedAt: updatedProfileRecord.action.timestamp,
      }
    },
    whoami: async (cellId: CellId): Promise<WhoAmIOutput> => {
      let myWeaveProfile = await profilesClient.getAgentProfile(myPubKey)
      return {
        actionHash: encodeHashToBase64(myWeaveProfile.actionHash),
        entryHash: encodeHashToBase64(myWeaveProfile.entryHash),
        entry: weaveToAcornProfile(
          myWeaveProfile.entry,
          encodeHashToBase64(myPubKey)
        ),
        createdAt: myWeaveProfile.action.timestamp,
        updatedAt: myWeaveProfile.action.timestamp,
      }
    },
    fetchAgents: async (cellId: CellId): Promise<Array<Profile>> => {
      const weaveProfiles = await Promise.all(
        (await profilesClient.getAgentsWithProfile()).map(
          async (agentPubKey) => {
            return [
              agentPubKey,
              await profilesClient.getAgentProfile(agentPubKey),
            ] as [AgentPubKey, EntryRecord<WeaveProfile>]
          }
        )
      )
      return weaveProfiles
        .filter((weaveProfile) => weaveProfile[1]?.entry)
        .map((weaveProfile) =>
          weaveToAcornProfile(
            weaveProfile[1].entry,
            encodeHashToBase64(weaveProfile[0])
          )
        )
    },
    fetchAgentAddress: async (cellId: CellId): Promise<AgentPubKeyB64> => {
      return encodeHashToBase64(profilesClient.client.myPubKey)
    },
  }
}
