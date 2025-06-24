import { HoloHash, CellId, encodeHashToBase64 } from '@holochain/client'
import BufferAll from 'buffer/'
import { Profile } from 'zod-models'
import { Option } from './types/shared'
import { isWeaveContext } from '@theweave/api'
import { getWeaveProfilesClient } from './hcWebsockets'
import { weaveToAcornProfile } from './api/profilesApi'

const Buffer = BufferAll.Buffer

export function hashToString(hash: HoloHash) {
  const bytes = Array.from(hash)
  return bytes.join(',')
}

export function hashFromString(str: string): HoloHash {
  const bytes = str.split(',').map(Number)
  return Buffer.from(bytes)
}

const CELL_ID_DIVIDER = '[:cell_id_divider:]'
export function cellIdToString(cellId: CellId) {
  // [DnaHash, AgentPubKey]
  return hashToString(cellId[0]) + CELL_ID_DIVIDER + hashToString(cellId[1])
}

export function cellIdFromString(str: string): CellId {
  // [DnaHash, AgentPubKey]
  const [dnahashstring, agentpubkeyhashstring] = str.split(CELL_ID_DIVIDER)
  return [hashFromString(dnahashstring), hashFromString(agentpubkeyhashstring)]
}

export function getCurrentDateFormatted() {
  const now = new Date()

  const year = now.getFullYear()
  // getMonth() returns a zero-based month, so +1 to get the correct month number
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

const LOCAL_STORAGE_PREFIX = 'acorn-'
export const getLocalItem = (key) => {
  return localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`)
}
export const setLocalItem = (key, value) => {
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, value)
}

const MY_PROFILE_KEY = 'MY_PROFILE';
/**
 * Read my profile from localStorage
 *
 * @returns
 */
export function readMyLocalProfile(): Option<Profile> {
  const maybeProfile = getLocalItem(MY_PROFILE_KEY);
  return maybeProfile ? JSON.parse(maybeProfile) : null;
}

/**
 * Write my profile to localStorage
 *
 * @param profile
 */
export function writeMyLocalProfile(profile: Profile): void {
  setLocalItem(MY_PROFILE_KEY, JSON.stringify(profile));
}

/**
 * Reads the profile from localStorage in the Acorn Desktop case
 * or fetches it from Moss in the Weave case.
 *
 * @returns
 */
export async function fetchMyLocalProfile(): Promise<Option<Profile>> {
  if (isWeaveContext()) {
    const profilesClient = await getWeaveProfilesClient();
    const myPubKey = profilesClient.client.myPubKey;
    const myProfile = await profilesClient.getAgentProfile(myPubKey);
    return weaveToAcornProfile(myProfile.entry, encodeHashToBase64(myPubKey));
  } else {
    return readMyLocalProfile();
  }
}