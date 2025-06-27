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
  createWhoami: (payload: Profile) => Promise<WireRecord<Profile>>
  updateWhoami: (payload: UpdateInput<Profile>) => Promise<WireRecord<Profile>>
  whoami: () => Promise<WhoAmIOutput>
  fetchAgents: () => Promise<Array<Profile>>
  fetchAgentAddress: () => Promise<AgentPubKeyB64>
}

const ProfilesApi = (appWebsocket: AppClient, cellId: CellId): IProfilesApi => {
  return {
    createWhoami: async (payload: Profile): Promise<WireRecord<Profile>> => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.CREATE_WHOAMI,
        payload
      )
    },
    updateWhoami: async (
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
    whoami: async (): Promise<WhoAmIOutput> => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.WHOAMI,
        null
      )
    },
    fetchAgents: async (): Promise<Array<Profile>> => {
      return callZome(
        appWebsocket,
        cellId,
        PROFILES_ZOME_NAME,
        ZOME_FN_NAMES.FETCH_AGENTS,
        null
      )
    },
    fetchAgentAddress: async (): Promise<AgentPubKeyB64> => {
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
  constructor(
    appWebsocket: AppClient,
    cellId: CellId,
    profilesClient?: ProfilesClient
  ) {
    this.appWebsocket = appWebsocket
    this.profile = profilesClient
      ? WeaveProfilesApi(profilesClient)
      : ProfilesApi(appWebsocket, cellId)
  }
}

const schemaShape = ProfileSchema.shape

const acornFields = Object.keys(schemaShape)

export function weaveToAcornProfile(
  weaveProfile: WeaveProfile,
  agentPubKey: string
): Profile {
  return {
    avatarUrl: weaveProfile.fields['avatar'] || '',
    agentPubKey,
    status: 'Online',
    firstName: weaveProfile.nickname,
    lastName: '',
    handle: weaveProfile.nickname,
    isImported: false,
  }
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
    createWhoami: async (_payload: Profile): Promise<WireRecord<Profile>> => {
      throw new Error(
        'Cannot create profile. Profile must be received via WeaveClient.'
      )
    },
    updateWhoami: async (
      payload: UpdateInput<Profile>
    ): Promise<WireRecord<Profile>> => {
      throw new Error(
        'Cannot update profile. Profile must be updated in the Moss group.'
      )
    },
    whoami: async (): Promise<WhoAmIOutput> => {
      try {
        console.log('whoami')
        let myWeaveProfile = await profilesClient.getAgentProfile(myPubKey)
        console.log('myWeaveProfile', myWeaveProfile)
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
      } catch (e) {
        console.log('Error fetching whoami', e)
        return {
          actionHash: '',
          entryHash: '',
          entry: {
            agentPubKey: encodeHashToBase64(myPubKey),
            avatarUrl: 'uknown',
            status: 'Offline',
            isImported: false,
            firstName: 'unknown',
            lastName: 'unknown',
            handle: 'unknown',
          },
          createdAt: 12345,
          updatedAt: 12345,
        }
      }
    },
    fetchAgents: async (): Promise<Array<Profile>> => {
      try {
        const weaveProfiles = await Promise.all(
          (await profilesClient.getAgentsWithProfile()).map(
            async (agentPubKey) => {
              try {
                return [
                  agentPubKey,
                  await profilesClient.getAgentProfile(agentPubKey),
                ] as [AgentPubKey, EntryRecord<WeaveProfile>]
              } catch (e) {
                console.log('Error fetching agent profile', e)
                return [
                  agentPubKey,
                  { entry: { nickname: 'unknown', fields: {} } },
                ] as [AgentPubKey, EntryRecord<WeaveProfile>]
              }
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
      } catch (e) {
        return []
      }
    },
    fetchAgentAddress: async (): Promise<AgentPubKeyB64> => {
      return encodeHashToBase64(profilesClient.client.myPubKey)
    },
  }
}
