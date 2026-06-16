/**
 * getHarnessClient — resolve the HarnessClient for the current runtime context,
 * mirroring how the app already picks its host (isWeaveContext() in index.tsx /
 * hcWebsockets.ts):
 *
 *   - Moss / Weave  → MossHarnessClient (a future Weave host-API affordance;
 *                     unavailable in @theweave/api 0.6.6, so it reports
 *                     `available = false` today).
 *   - everything else (standalone / Kangaroo / web dev) → DevSidecarHarnessClient,
 *                     which talks to the dev-server harness sidecar over a
 *                     WebSocket (and, later, the same protocol to the packaged
 *                     Kangaroo main process).
 *
 * Callers consume the returned client purely through the HarnessClient interface
 * and should gate UI on `.available`.
 */
import { isWeaveContext } from '@theweave/api'
import { getWeaveClient } from '../hcWebsockets'
import { HarnessClient } from './types'
import { DevSidecarHarnessClient } from './devSidecarClient'
import { MossHarnessClient } from './mossClient'

let cached: HarnessClient | null = null

export function getHarnessClient(): HarnessClient {
  if (cached) return cached
  cached = isWeaveContext()
    ? new MossHarnessClient(getWeaveClient())
    : new DevSidecarHarnessClient()
  return cached
}

export * from './types'
