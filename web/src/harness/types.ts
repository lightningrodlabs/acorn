/**
 * HarnessClient — the renderer-facing, transport-neutral interface to a local
 * LLM harness (an ACP agent: Agent Client Protocol, JSON-RPC over stdio).
 *
 * WHY this lives here and not in the renderer's ACP code: the renderer is a
 * browser context — it cannot spawn the agent subprocess ACP requires. The ACP
 * client lives in a HOST that can spawn (the dev-server sidecar today; the
 * Kangaroo Electron main or a Moss/Weave host-affordance later). This interface
 * is a projection of ACP's session model so the renderer consumes a harness
 * without importing any ACP types — the providers differ only in transport:
 *
 *   - DevSidecarHarnessClient — WebSocket to the dev-server sidecar (and, later,
 *     the same protocol to the packaged Kangaroo main process).
 *   - MossHarnessClient — a future Weave host-API harness affordance.
 *
 * Mirrors the existing host-affordance pattern (isWeaveContext() + @theweave/api).
 */

/** A block of prompt content sent to the agent (ACP ContentBlock, subset). */
export type HarnessContentBlock =
  | { type: 'text'; text: string }
  | { type: 'resource'; uri: string; mimeType?: string; text: string }

/** One entry of the agent's plan (ACP `plan` update). */
export interface HarnessPlanEntry {
  content: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
}

/**
 * A streamed update during a turn — a projection of ACP `session/update`. The
 * `plan` variant carries the COMPLETE entry list each time (ACP replaces, it does
 * not merge), and is the seam the later draft pipeline leans on.
 */
export type HarnessUpdate =
  | { type: 'message'; text: string } // agent_message_chunk
  | { type: 'thought'; text: string } // agent_thought_chunk
  | {
      type: 'tool_call'
      toolCallId: string
      title: string
      status: 'pending' | 'in_progress' | 'completed' | 'failed'
      kind?: string
    }
  | { type: 'plan'; entries: HarnessPlanEntry[] }
  | { type: 'mode'; modeId: string }

/** Why a turn ended (ACP StopReason). */
export type HarnessStopReason =
  | 'end_turn'
  | 'max_tokens'
  | 'max_turn_requests'
  | 'refusal'
  | 'cancelled'

export interface HarnessTurnResult {
  stopReason: HarnessStopReason
}

/** A permission request from the agent (ACP `session/request_permission`). */
export interface HarnessPermissionRequest {
  toolCall: { toolCallId: string; title: string; kind?: string }
  options: Array<{
    optionId: string
    name: string
    kind: 'allow_once' | 'allow_always' | 'reject_once' | 'reject_always'
  }>
}

/** The human's decision: pick an option, or cancel the turn. */
export type HarnessPermissionDecision =
  | { outcome: 'selected'; optionId: string }
  | { outcome: 'cancelled' }

export type Unsubscribe = () => void

/**
 * A call the agent makes into an ACORN-HOSTED tool (the draft pipeline L1 +
 * the read leaf): the renderer is where the live tree + redux store live, so the
 * hosted MCP server bridges `tools/call` back here. `read_tree` returns the
 * current ProjectSnapshot; `propose_edits` opens a draft from a ProjectDiff
 * (inert — no DHT write).
 */
export interface HarnessToolCall {
  tool: string
  args: any
}
export type HarnessToolResult =
  | { ok: true; result: any }
  | { ok: false; error: string }

export interface HarnessInfo {
  protocolVersion: number
  agentName?: string
  /** agent advertises ACP session/load — sessions resume across a full restart */
  canLoadSession?: boolean
  /** names of MCP servers attached to the agent's sessions (for display) */
  mcpServers?: string[]
}

/** What the host still holds for a session, as reported on connect. */
export interface HarnessSessionInfo {
  sessionId: string
  /** a turn is running on the host right now (possibly one WE didn't start) */
  inFlight: boolean
}

export interface HarnessSession {
  readonly id: string
  /** Send a prompt; resolves when the WHOLE turn ends. Stream via `on('update')`. */
  prompt(blocks: HarnessContentBlock[]): Promise<HarnessTurnResult>
  /** Cancel the in-flight turn (ACP `session/cancel`). */
  cancel(): void
  on(event: 'update', cb: (u: HarnessUpdate) => void): Unsubscribe
  /**
   * Learn that a turn ended WITHOUT having sent its prompt — the case after a
   * reload, where the host kept running a turn the previous renderer started.
   * `prompt()`'s promise belonged to that dead connection, so an adopted turn
   * has no other way to know it finished. Optional: a provider that can't
   * report a foreign turn's end simply omits it, and adoption is refused.
   */
  onTurnEnd?(cb: (result: HarnessTurnResult) => void): Unsubscribe
  dispose(): Promise<void>
}

export interface HarnessClient {
  /** True only when a harness host is reachable in this context (else hide chat). */
  readonly available: boolean
  /** ACP `initialize` + capability negotiation. */
  initialize(): Promise<HarnessInfo>
  /**
   * Start a session. `treeContext`, when given, is handed to the agent as the
   * live read_tree snapshot (an embedded resource), so the agent starts knowing
   * the tree.
   */
  newSession(opts: {
    cwd?: string
    treeContext?: HarnessContentBlock
  }): Promise<HarnessSession>
  /**
   * Reattach to an existing session by id (e.g. after a renderer reload). Rejects
   * if the host no longer holds that session. Optional — a provider that can't
   * persist sessions across reloads simply omits it.
   */
  resumeSession?(sessionId: string): Promise<HarnessSession>
  /**
   * Sessions the host still holds, and whether each is mid-turn. Asked on
   * connect: a renderer reload drops the socket but not the agent, so turns can
   * be running that this renderer knows nothing about. Optional — a provider
   * without durable sessions omits it and nothing is reattached.
   */
  listSessions?(): Promise<HarnessSessionInfo[]>
  /** Register the handler the host calls when the agent requests permission.
   *  `sessionId` (when the host knows it) attributes the request to a session,
   *  so concurrent sessions' requests can be told apart. */
  onPermissionRequest(
    handler: (
      req: HarnessPermissionRequest,
      sessionId?: string
    ) => Promise<HarnessPermissionDecision>
  ): void
  /**
   * Register the handler the host calls when the agent invokes an Acorn-hosted
   * tool (read_tree / propose_edits). Optional — a provider without the hosted
   * callable-tool channel simply omits it. `sessionId` (when the host could
   * attribute the call) routes the call to that session's project — with
   * concurrent sessions the displayed project is NOT necessarily the caller's.
   */
  onToolCall?(
    handler: (
      call: HarnessToolCall,
      sessionId?: string
    ) => Promise<HarnessToolResult>
  ): void
}
