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
  HarnessSessionInfo,
  HarnessStopReason,
  HarnessToolCall,
  HarnessToolResult,
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
  // which sessions does the host still hold, and which are mid-turn? Asked on
  // connect so a reload can reattach turns it did not start.
  | { t: 'sessions'; id: number }
  | { t: 'cancel'; sessionId: string }
  | {
      t: 'permissionDecision'
      requestId: number
      decision: HarnessPermissionDecision
    }
  // reply to a hosted tool call (read_tree / propose_edits), correlated by requestId
  | {
      t: 'toolResult'
      requestId: number
      result: HarnessToolResult
    }

/** sidecar → renderer */
export type ServerFrame =
  // replies (correlated by id)
  | { t: 'initialized'; id: number; info: HarnessInfo }
  | { t: 'sessionCreated'; id: number; sessionId: string }
  | { t: 'sessionResumed'; id: number; sessionId: string }
  | { t: 'sessionResumeFailed'; id: number }
  | { t: 'turnEnd'; id: number; stopReason: HarnessStopReason }
  | { t: 'sessionList'; id: number; sessions: HarnessSessionInfo[] }
  | { t: 'error'; id: number; message: string }
  // unsolicited
  | { t: 'update'; sessionId: string; update: HarnessUpdate }
  // A turn ended, addressed by SESSION rather than by the prompt's correlation
  // id: a renderer that reattached after a reload never sent that prompt, so the
  // correlated `turnEnd` means nothing to it. Sent alongside `turnEnd`, always.
  | { t: 'turnEnded'; sessionId: string; stopReason: HarnessStopReason }
  | {
      t: 'permissionRequest'
      requestId: number
      sessionId: string
      request: HarnessPermissionRequest
    }
  // the agent invoked an Acorn-hosted tool; the renderer runs it and replies
  // with a toolResult carrying the same requestId. `sessionId` is the session
  // the sidecar attributed the call to (absent when it couldn't tell): the MCP
  // bridge itself is sessionless, so the sidecar infers it — see sidecar.js
  // attributeToolSession — and the renderer routes to that session's project.
  | {
      t: 'toolCall'
      requestId: number
      sessionId?: string
      call: HarnessToolCall
    }
  | { t: 'unavailable'; reason: string }
