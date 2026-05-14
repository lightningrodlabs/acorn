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

// ============================================================================
// Safe Interval Utilities
// ============================================================================

export interface SafeIntervalOptions {
  /** Human-readable name for logging purposes */
  name: string
  /** The async function to call periodically */
  fn: () => Promise<void>
  /** Interval in milliseconds between the END of one call and the START of the next */
  intervalMs: number
  /** Optional: run on the next tick instead of waiting a full interval before the first call (default: false) */
  runOnNextTick?: boolean
}

export interface SafeIntervalHandle {
  /** Cancel the interval - any in-progress call will complete but no more will be scheduled */
  cancel: () => void
}

/**
 * Creates a safe interval that prevents stacking of async calls.
 *
 * Unlike setInterval, this uses a self-rescheduling pattern:
 * - Waits for the current call to complete before scheduling the next
 * - The interval is measured from the END of one call to the START of the next
 * - This prevents call buildup when operations are slow
 *
 * Logs a warning if the operation takes longer than the interval.
 */
export function safeSetInterval(options: SafeIntervalOptions): SafeIntervalHandle {
  const { name, fn, intervalMs, runOnNextTick = false } = options

  let isCancelled = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const executeAndSchedule = async () => {
    if (isCancelled) return

    const startTime = Date.now()

    try {
      await fn()
    } catch (error) {
      console.error(`[SafeInterval] "${name}" error:`, error)
    } finally {
      const duration = Date.now() - startTime

      if (duration > intervalMs) {
        console.warn(
          `[SafeInterval] "${name}" took ${duration / 1000}s, which is ${(duration - intervalMs) / 1000}s longer than the ${intervalMs / 1000}s interval`
        )
      }

      // Schedule next execution after the interval
      if (!isCancelled) {
        timeoutId = setTimeout(executeAndSchedule, intervalMs)
      }
    }
  }

  // Start the interval
  if (runOnNextTick) {
    timeoutId = setTimeout(executeAndSchedule, 0)
  } else {
    timeoutId = setTimeout(executeAndSchedule, intervalMs)
  }

  return {
    cancel: () => {
      isCancelled = true
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    },
  }
}
