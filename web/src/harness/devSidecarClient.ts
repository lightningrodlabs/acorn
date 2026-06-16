/**
 * DevSidecarHarnessClient — the standalone/Kangaroo provider.
 *
 * Talks to the dev-server harness sidecar over a WebSocket at /__acorn_harness
 * (extends the /__acorn_diff dev-bridge pattern; ACP streams turn updates, so a
 * socket — not GET/POST — is needed). The sidecar owns the ACP connection and
 * spawns the agent. The SAME protocol later points at the packaged Kangaroo main
 * process, so nothing here is dev-server-specific beyond the URL.
 *
 * Availability: in a production build there is no sidecar, so `available` is
 * false (gated on dev mode, the same signal index.tsx uses). In dev `available`
 * is optimistic; `initialize()` is the real liveness gate and rejects if the
 * sidecar reports no agent is configured.
 */
import {
  HarnessClient,
  HarnessContentBlock,
  HarnessInfo,
  HarnessPermissionDecision,
  HarnessPermissionRequest,
  HarnessSession,
  HarnessTurnResult,
  HarnessUpdate,
  Unsubscribe,
} from './types'
import { ClientFrame, ServerFrame } from './protocol'

const HARNESS_PATH = '/__acorn_harness'

type Pending = {
  resolve: (frame: ServerFrame) => void
  reject: (err: Error) => void
}

class SidecarSession implements HarnessSession {
  constructor(
    public readonly id: string,
    private client: DevSidecarHarnessClient
  ) {}

  prompt(blocks: HarnessContentBlock[]): Promise<HarnessTurnResult> {
    return this.client._prompt(this.id, blocks)
  }

  cancel(): void {
    this.client._send({ t: 'cancel', sessionId: this.id })
  }

  on(event: 'update', cb: (u: HarnessUpdate) => void): Unsubscribe {
    if (event !== 'update') return () => {}
    return this.client._onUpdate(this.id, cb)
  }

  async dispose(): Promise<void> {
    this.cancel()
    this.client._disposeSession(this.id)
  }
}

export class DevSidecarHarnessClient implements HarnessClient {
  private ws: WebSocket | null = null
  private connecting: Promise<void> | null = null
  private nextId = 1
  private pending = new Map<number, Pending>()
  private updateSubs = new Map<string, Set<(u: HarnessUpdate) => void>>()
  private permissionHandler:
    | ((req: HarnessPermissionRequest) => Promise<HarnessPermissionDecision>)
    | null = null
  private unavailableReason: string | null = null

  get available(): boolean {
    // No sidecar in a production build. In dev, defer the real check to
    // initialize(); a discovered unavailability latches here.
    if (this.unavailableReason) return false
    return Boolean(process.env.__DEV_MODE__)
  }

  async initialize(): Promise<HarnessInfo> {
    await this._connect()
    const reply = await this._request({ t: 'initialize', id: this._id() })
    if (reply.t !== 'initialized') throw new Error('initialize failed')
    return reply.info
  }

  async newSession(opts: {
    cwd?: string
    treeContext?: HarnessContentBlock
  }): Promise<HarnessSession> {
    await this._connect()
    const reply = await this._request({
      t: 'newSession',
      id: this._id(),
      cwd: opts.cwd,
      treeContext: opts.treeContext,
    })
    if (reply.t !== 'sessionCreated') throw new Error('newSession failed')
    return new SidecarSession(reply.sessionId, this)
  }

  onPermissionRequest(
    handler: (
      req: HarnessPermissionRequest
    ) => Promise<HarnessPermissionDecision>
  ): void {
    this.permissionHandler = handler
  }

  // --- internals used by SidecarSession ---

  async _prompt(
    sessionId: string,
    blocks: HarnessContentBlock[]
  ): Promise<HarnessTurnResult> {
    const reply = await this._request({
      t: 'prompt',
      id: this._id(),
      sessionId,
      blocks,
    })
    if (reply.t !== 'turnEnd') throw new Error('prompt failed')
    return { stopReason: reply.stopReason }
  }

  _onUpdate(sessionId: string, cb: (u: HarnessUpdate) => void): Unsubscribe {
    let set = this.updateSubs.get(sessionId)
    if (!set) {
      set = new Set()
      this.updateSubs.set(sessionId, set)
    }
    set.add(cb)
    return () => set?.delete(cb)
  }

  _disposeSession(sessionId: string): void {
    this.updateSubs.delete(sessionId)
  }

  _send(frame: ClientFrame): void {
    this.ws?.send(JSON.stringify(frame))
  }

  // --- connection / request plumbing ---

  private _id(): number {
    return this.nextId++
  }

  private _connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return Promise.resolve()
    if (this.connecting) return this.connecting
    this.connecting = new Promise<void>((resolve, reject) => {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws'
      const ws = new WebSocket(`${proto}://${location.host}${HARNESS_PATH}`)
      this.ws = ws
      ws.onopen = () => resolve()
      ws.onerror = () => reject(new Error('harness sidecar not reachable'))
      ws.onclose = () => {
        this.ws = null
        this.connecting = null
        for (const p of this.pending.values())
          p.reject(new Error('harness connection closed'))
        this.pending.clear()
      }
      ws.onmessage = (ev) => this._onMessage(ev)
    })
    return this.connecting
  }

  private _request(frame: ClientFrame & { id: number }): Promise<ServerFrame> {
    return new Promise((resolve, reject) => {
      this.pending.set(frame.id, { resolve, reject })
      this._send(frame)
    })
  }

  private async _onMessage(ev: MessageEvent): Promise<void> {
    let frame: ServerFrame
    try {
      frame = JSON.parse(ev.data as string)
    } catch {
      return
    }
    switch (frame.t) {
      case 'unavailable':
        this.unavailableReason = frame.reason
        for (const p of this.pending.values())
          p.reject(new Error(frame.reason))
        this.pending.clear()
        return
      case 'update': {
        // bind to a const so the narrowed type survives inside the closure
        const f = frame
        const subs = this.updateSubs.get(f.sessionId)
        subs?.forEach((cb) => cb(f.update))
        return
      }
      case 'permissionRequest': {
        const decision: HarnessPermissionDecision = this.permissionHandler
          ? await this.permissionHandler(frame.request)
          : { outcome: 'cancelled' }
        this._send({
          t: 'permissionDecision',
          requestId: frame.requestId,
          decision,
        })
        return
      }
      default: {
        // a correlated reply
        const id = (frame as { id?: number }).id
        if (id == null) return
        const p = this.pending.get(id)
        if (!p) return
        this.pending.delete(id)
        if (frame.t === 'error') p.reject(new Error(frame.message))
        else p.resolve(frame)
      }
    }
  }
}
