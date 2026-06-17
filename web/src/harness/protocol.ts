/**
 * The WebSocket frame protocol between the renderer (DevSidecarHarnessClient) and
 * the dev-server harness sidecar. The sidecar is plain Node CommonJS and cannot
 * import these types, so it constructs matching plain objects — keep the two in
 * sync. Frames carry a correlation `id` for request/response; updates and
 * permission requests are pushed unsolicited.
 */
import {
  HarnessContentBlock,
  HarnessInfo,
  HarnessPermissionDecision,
  HarnessPermissionRequest,
  HarnessStopReason,
  HarnessUpdate,
} from './types'

/** renderer → sidecar */
export type ClientFrame =
  | { t: 'initialize'; id: number }
  | {
      t: 'newSession'
      id: number
      cwd?: string
      treeContext?: HarnessContentBlock
    }
  | { t: 'prompt'; id: number; sessionId: string; blocks: HarnessContentBlock[] }
  | { t: 'resumeSession'; id: number; sessionId: string }
  | { t: 'cancel'; sessionId: string }
  | {
      t: 'permissionDecision'
      requestId: number
      decision: HarnessPermissionDecision
    }

/** sidecar → renderer */
export type ServerFrame =
  // replies (correlated by id)
  | { t: 'initialized'; id: number; info: HarnessInfo }
  | { t: 'sessionCreated'; id: number; sessionId: string }
  | { t: 'sessionResumed'; id: number; sessionId: string }
  | { t: 'sessionResumeFailed'; id: number }
  | { t: 'turnEnd'; id: number; stopReason: HarnessStopReason }
  | { t: 'error'; id: number; message: string }
  // unsolicited
  | { t: 'update'; sessionId: string; update: HarnessUpdate }
  | {
      t: 'permissionRequest'
      requestId: number
      sessionId: string
      request: HarnessPermissionRequest
    }
  | { t: 'unavailable'; reason: string }
