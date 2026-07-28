/**
 * Sidecar session bookkeeping (dev-harness/sidecar.js), the two pure decisions
 * concurrent sessions rest on:
 *
 *   attributeToolSession — which session does a hosted tool call belong to?
 *   sessionListFor       — what does a just-connected renderer need to adopt?
 *
 * attributeToolSession: The MCP bridge's HTTP POSTs are sessionless, so with
 * concurrent turns (session registry) the sidecar must infer the caller:
 * explicit id > single in-flight turn > the session whose Acorn tool_call
 * update arrived last > give up (renderer falls back to the displayed project).
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  attributeToolSession,
  sessionListFor,
} = require('../dev-harness/sidecar.js')

const state = (
  inFlight: string[],
  last?: { sessionId: string; at: number }
) => ({
  activePrompts: new Map(inFlight.map((s, i) => [i + 1, s])),
  lastAcornToolSession: last || null,
})

describe('attributeToolSession', () => {
  it('an explicit session id (direct backend threads it) always wins', () => {
    expect(attributeToolSession(state(['A', 'B']), 'C')).toBe('C')
  })

  it('a single in-flight turn is unambiguous', () => {
    expect(attributeToolSession(state(['A']))).toBe('A')
  })

  it('two prompts on the SAME session still count as one candidate', () => {
    expect(attributeToolSession(state(['A', 'A']))).toBe('A')
  })

  it('no in-flight turn and no hint → unattributed', () => {
    expect(attributeToolSession(state([]))).toBeUndefined()
  })

  it('concurrent turns: the last pending Acorn tool_call update breaks the tie', () => {
    const s = state(['A', 'B'], { sessionId: 'B', at: Date.now() })
    expect(attributeToolSession(s)).toBe('B')
  })

  it('a stale tie-break hint (>60s) is ignored', () => {
    const s = state(['A', 'B'], { sessionId: 'B', at: Date.now() - 120_000 })
    expect(attributeToolSession(s)).toBeUndefined()
  })

  it('a hint for a session with no turn in flight is ignored', () => {
    const s = state(['A', 'B'], { sessionId: 'C', at: Date.now() })
    expect(attributeToolSession(s)).toBeUndefined()
  })
})

describe('sessionListFor', () => {
  const held = (sessions: string[], inFlight: string[]) => ({
    sessions: new Set(sessions),
    // prompt frame id -> sessionId, as the sidecar tracks in-flight turns
    activePrompts: new Map(inFlight.map((s, i) => [i + 1, s])),
  })

  it('reports every held session, flagging the ones mid-turn', () => {
    expect(sessionListFor(held(['A', 'B', 'C'], ['B']))).toEqual([
      { sessionId: 'A', inFlight: false },
      { sessionId: 'B', inFlight: true },
      { sessionId: 'C', inFlight: false },
    ])
  })

  it('counts a session with two prompts in flight once', () => {
    expect(sessionListFor(held(['A'], ['A', 'A']))).toEqual([
      { sessionId: 'A', inFlight: true },
    ])
  })

  it('never reports a turn for a session the host no longer holds', () => {
    // an agent restart clears `sessions`; a stale activePrompts entry must not
    // conjure a session the renderer would then try (and fail) to resume
    expect(sessionListFor(held([], ['ghost']))).toEqual([])
  })

  it('is empty when nothing is held', () => {
    expect(sessionListFor(held([], []))).toEqual([])
  })
})
