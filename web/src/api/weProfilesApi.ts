import { AppWebsocket, CellId } from '@holochain/client'
import { WeServices } from '@lightningrodlabs/we-applet'
import { Profile, Status, WhoAmIOutput } from '../types'
import { AgentPubKeyB64, UpdateInput } from '../types/shared'
import { WireRecord } from './hdkCrud'
import { get } from 'svelte/store'
import { serializeHash } from '../utils'

function weToAcornProfile(weProfile: WeProfile, weServices: WeServices): Profile {
    let acornProfile = {}
    // constrains the fields only to what acorn wants/expects (in case other fields have been added by other applets)
    const acornFields = ['firstName', 'lastName', 'handle', 'status', 'avatarUrl', 'agentPubKey', 'isImported']

    // field each acorn profile field, check if it exists in the we Profile, if it does, use that, if not, use defaults
    acornFields.forEach((key) => {
        if (key === 'isImported') {
            // default to false, unless field exists, then parse into bool from string
            acornProfile[key] = weProfile.fields[key] ? JSON.parse(weProfile.fields[key]) : false
        }
        else if (key === 'status') {
            // default to offline until the fields exists
            acornProfile[key] = weProfile.fields[key] ? weProfile.fields[key] as Status : "Offline" as Status
        }
        else if (key === 'agentPubKey') {
            acornProfile[key] = weProfile.fields[key] ? weProfile.fields[key] : serializeHash(weServices.profilesStore.myAgentPubKey)
      return serializeHash(weServices.profilesStore.myAgentPubKey)
        }
        else if (key === 'avatarUrl') {
            acornProfile[key] = weProfile.fields[key] ? JSON.parse(weProfile.fields[key]) : ''
        }
        else {
            // if no first and last name and handle are given, use the nickname
            acornProfile[key] = weProfile.fields[key] ? weProfile.fields[key] : weProfile.nickname
        }

    })
    return acornProfile as Profile
}
function acornToWeProfile(acornProfile: Profile, weProfile: WeProfile): WeProfile {
    Object.keys(acornProfile).forEach((key) => {
        if (key === 'isImported') {
            weProfile.fields[key] = JSON.stringify(acornProfile[key])
        }
        else {
            weProfile.fields[key] = acornProfile[key]
        }
    })
    return weProfile
}
async function getMyNickname(weServices: WeServices): Promise<string> {
    let myWeProfile = get(await weServices.profilesStore.fetchMyProfile());
    return myWeProfile.nickname
}
export interface WeProfile {
    nickname: string;
    fields: Record<string, string>;
}
const WeProfilesApi = (appWebsocket: AppWebsocket, weServices: WeServices) => {
  return {
    createWhoami: async (cellId: CellId, payload: Profile): Promise<WireRecord<Profile>> => {
        let myWeProfile = get(await weServices.profilesStore.fetchMyProfile());
        const profile = acornToWeProfile(payload, myWeProfile)
        await weServices.profilesStore.updateProfile(profile)
        return {
            actionHash: null,
            entryHash: null,
            entry: payload,
            createdAt: null,
            updatedAt: null,
        }
    },
    createImportedProfile: async (cellId: CellId, payload: Profile): Promise<WireRecord<Profile>> => {
        let myWeProfile = get(await weServices.profilesStore.fetchMyProfile());
        const profile = acornToWeProfile(payload, myWeProfile)
        await weServices.profilesStore.updateProfile(profile)
        return {
            actionHash: null,
            entryHash: null,
            entry: payload,
            createdAt: null,
            updatedAt: null,
        }
    },
    updateWhoami: async (cellId: CellId, payload: UpdateInput<Profile>): Promise<WireRecord<Profile>> => {
        let myWeProfile = get(await weServices.profilesStore.fetchMyProfile());
        const profile = acornToWeProfile(payload.entry, myWeProfile)
        await weServices.profilesStore.updateProfile(profile)
        return {
            actionHash: null,
            entryHash: null,
            entry: payload.entry,
            createdAt: null,
            updatedAt: null,
        }
    },
    whoami: async (cellId: CellId): Promise<WhoAmIOutput> => {
        let myWeProfile = get(await weServices.profilesStore.fetchMyProfile());
        return {
            actionHash: null,
            entryHash: null,
            entry: weToAcornProfile(myWeProfile, weServices),
            createdAt: null,
            updatedAt: null,
        }
    },
    fetchAgents: async (cellId: CellId): Promise<Array<Profile>> => {
      let profiles: Array<Profile> = get(await weServices.profilesStore.fetchAllProfiles()).values().map((weProfile) => weToAcornProfile(weProfile, weServices));
      return profiles
    },
    fetchAgentAddress: async (cellId: CellId): Promise<AgentPubKeyB64> => {
      // is this an alright way to convert the byte array to string?
      return serializeHash(weServices.profilesStore.myAgentPubKey)
    },
  }
}

export default class WeProfilesZomeApi {
  appWebsocket: AppWebsocket
  profile: ReturnType<typeof WeProfilesApi>
  constructor(appWebsocket: AppWebsocket, weServices: WeServices) {
    this.appWebsocket = appWebsocket
    this.profile = WeProfilesApi(appWebsocket, weServices)
  }
}
