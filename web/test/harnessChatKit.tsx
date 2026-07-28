/**
 * Shared fakes for HarnessChat panel-level tests (harnessChatPanel.test.tsx,
 * harnessChatStack.test.tsx). Everything below the panel is real (registry,
 * chatHistory, localStorage); only the harness transport is faked, so a turn's
 * timing is under the test's control. Each test file still owns its jest.mock
 * seams (mocks are hoisted per file) — this kit is just the pure fakes.
 */
import {
  HarnessContentBlock,
  HarnessStopReason,
  HarnessUpdate,
} from '../src/harness/types'

/** A HarnessSession whose turn ends only when the test says so. */
export class FakeSession {
  readonly id: string
  readonly prompts: HarnessContentBlock[][] = []
  cancelled = 0
  private subs = new Set<(u: HarnessUpdate) => void>()
  private turnEndSubs = new Set<
    (r: { stopReason: HarnessStopReason }) => void
  >()
  private finishTurn:
    | ((r: { stopReason: HarnessStopReason }) => void)
    | null = null

  constructor(id: string) {
    this.id = id
  }
  prompt(blocks: HarnessContentBlock[]) {
    this.prompts.push(blocks)
    return new Promise<{ stopReason: HarnessStopReason }>((res) => {
      this.finishTurn = res
    })
  }
  cancel() {
    this.cancelled++
  }
  on(_event: 'update', cb: (u: HarnessUpdate) => void) {
    this.subs.add(cb)
    return () => this.subs.delete(cb)
  }
  onTurnEnd(cb: (r: { stopReason: HarnessStopReason }) => void) {
    this.turnEndSubs.add(cb)
    return () => this.turnEndSubs.delete(cb)
  }
  async dispose() {}

  /** stream an update into whatever is listening (the registry's turn) */
  emit(u: HarnessUpdate) {
    for (const cb of [...this.subs]) cb(u)
  }
  /** the host's two announcements: to the prompter, and to any adopter */
  finish(stopReason: HarnessStopReason = 'end_turn') {
    this.finishTurn?.({ stopReason })
    this.finishTurn = null
    for (const cb of [...this.turnEndSubs]) cb({ stopReason })
  }
  get inFlight() {
    return this.finishTurn !== null
  }
}

export function fakeClient() {
  const sessions: FakeSession[] = []
  return {
    sessions,
    available: true,
    initialize: async () => ({
      protocolVersion: 1,
      agentName: 'test-agent',
      mcpServers: [],
    }),
    newSession: async () => {
      const s = new FakeSession(`S${sessions.length + 1}`)
      sessions.push(s)
      return s
    },
    // resuming finds the host's surviving session; unknown ids fail, and
    // openSession then starts a fresh one, as it does against a restarted host
    resumeSession: async (id: string) => {
      const live = sessions.find((s) => s.id === id)
      if (live) return live
      throw new Error('no such session')
    },
    // what a surviving sidecar reports on connect (see reattachInFlight)
    listSessions: async () =>
      sessions.map((s) => ({ sessionId: s.id, inFlight: s.inFlight })),
    onPermissionRequest: () => {},
    onToolCall: () => {},
  }
}

export const CELL = 'cellOne'
export const OTHER_CELL = 'cellTwo'

export const projectCollections = (name: string) => ({
  projectMeta: { name, actionHash: `pm-${name}` },
  outcomes: { o1: { content: 'root outcome' } },
  connections: {},
  outcomeMembers: {},
  outcomeComments: {},
  entryPoints: {},
  tags: {},
})

/** Minimal store: the panel reads the selection reactively and the project
 *  collections through readTree/readSelection, and dispatches keyboard focus. */
export function fakeStore() {
  const one = projectCollections('Living spec')
  const two = projectCollections('Other tree')
  const state: any = {
    ui: { selection: { selectedOutcomes: [] } },
    projects: {
      projectMeta: { [CELL]: one.projectMeta, [OTHER_CELL]: two.projectMeta },
      outcomes: { [CELL]: one.outcomes, [OTHER_CELL]: two.outcomes },
      connections: { [CELL]: {}, [OTHER_CELL]: {} },
      outcomeMembers: { [CELL]: {}, [OTHER_CELL]: {} },
      outcomeComments: { [CELL]: {}, [OTHER_CELL]: {} },
      entryPoints: { [CELL]: {}, [OTHER_CELL]: {} },
      tags: { [CELL]: {}, [OTHER_CELL]: {} },
    },
  }
  return {
    getState: () => state,
    dispatch: (a: any) => a,
    subscribe: () => () => {},
    replaceReducer: () => {},
  }
}
