import {
  ChatMessage,
  deriveTitle,
  emptySessionId,
  emptyStore,
  listScopedSessions,
  listSessions,
  loadStore,
  moveSession,
  pruneEmpty,
  reclaimSessions,
  removeSession,
  saveStore,
  scopeProject,
  upsertSession,
} from '../src/harness/chatHistory'

const msg = (id: number, role: ChatMessage['role'], text: string): ChatMessage => ({
  id,
  role,
  text,
})

describe('chatHistory transforms', () => {
  it('derives the title from the first non-empty user message', () => {
    expect(deriveTitle([])).toBe('New chat')
    expect(deriveTitle([msg(1, 'agent', 'hi')])).toBe('New chat')
    expect(
      deriveTitle([msg(1, 'system', '↻'), msg(2, 'user', '  add a leaf  ')])
    ).toBe('add a leaf')
    const long = 'x'.repeat(80)
    expect(deriveTitle([msg(1, 'user', long)])).toHaveLength(58) // 57 + ellipsis
  })

  it('upsertSession inserts, then replaces, and marks current', () => {
    let store = emptyStore()
    store = upsertSession(store, 'a', [msg(1, 'user', 'first')], 100)
    expect(store.currentId).toBe('a')
    expect(store.sessions).toHaveLength(1)

    store = upsertSession(store, 'b', [msg(1, 'user', 'second')], 200)
    expect(store.currentId).toBe('b')
    expect(store.sessions).toHaveLength(2)

    // updating an existing id replaces in place (no duplicate)
    store = upsertSession(store, 'a', [msg(1, 'user', 'first edited')], 300)
    expect(store.sessions).toHaveLength(2)
    expect(store.currentId).toBe('a')
    expect(store.sessions.find((s) => s.id === 'a')!.title).toBe('first edited')
  })

  it('removeSession drops it and clears current when it was current', () => {
    let store = emptyStore()
    store = upsertSession(store, 'a', [msg(1, 'user', 'a')], 100)
    store = upsertSession(store, 'b', [msg(1, 'user', 'b')], 200)
    store = removeSession(store, 'b')
    expect(store.sessions.map((s) => s.id)).toEqual(['a'])
    expect(store.currentId).toBeNull()
  })

  it('listSessions returns newest first', () => {
    let store = emptyStore()
    store = upsertSession(store, 'a', [msg(1, 'user', 'a')], 100)
    store = upsertSession(store, 'b', [msg(1, 'user', 'b')], 300)
    store = upsertSession(store, 'c', [msg(1, 'user', 'c')], 200)
    expect(listSessions(store).map((s) => s.id)).toEqual(['b', 'c', 'a'])
  })

  it('emptySessionId finds an unused (message-less) session', () => {
    let store = emptyStore()
    store = upsertSession(store, 'a', [msg(1, 'user', 'a')], 100)
    expect(emptySessionId(store)).toBeNull()
    store = upsertSession(store, 'b', [], 200)
    expect(emptySessionId(store)).toBe('b')
  })

  it('pruneEmpty drops unused sessions except the kept one', () => {
    let store = emptyStore()
    store = upsertSession(store, 'a', [msg(1, 'user', 'real')], 100) // has content
    store = upsertSession(store, 'b', [], 200) // empty, to keep
    store = upsertSession(store, 'c', [], 300) // empty, should be dropped
    const pruned = pruneEmpty(store, 'b')
    expect(pruned.sessions.map((s) => s.id).sort()).toEqual(['a', 'b'])
    expect(pruned.currentId).toBe('b') // current 'c' was dropped → falls back to keepId
  })
})

describe('upsertSession agent stamping', () => {
  it('stamps the owning agent and preserves it when later omitted', () => {
    let store = upsertSession(emptyStore(), 'a', [msg(1, 'user', 'hi')], 100, 'OpenCode')
    expect(store.sessions[0].agentName).toBe('OpenCode')
    // a later turn that doesn't pass an agent keeps the original stamp
    store = upsertSession(store, 'a', [msg(1, 'user', 'hi'), msg(2, 'agent', 'yo')], 200)
    expect(store.sessions[0].agentName).toBe('OpenCode')
  })
})

const CLAUDE_ID = '36ef0f82-9cc8-4008-b70e-120f38c47f7f' // RFC-4122 UUID
const OPENCODE_ID = 'ses_4kQ1example' // ses…-prefixed

describe('reclaimSessions (self-correcting, stamp-aware)', () => {
  beforeEach(() => localStorage.clear())

  it('pulls claude’s chats back out of the OpenCode scope (the mis-migration)', () => {
    const proj = 'p'
    // pre-stamp claude chat that wrongly landed under ::OpenCode
    saveStore(
      scopeProject(proj, 'OpenCode'),
      upsertSession(emptyStore(), CLAUDE_ID, [msg(1, 'user', 'mine')], 100)
    )
    reclaimSessions(proj, 'claude-code')

    const claude = loadStore(scopeProject(proj, 'claude-code'))
    expect(claude.sessions.map((s) => s.id)).toEqual([CLAUDE_ID])
    expect(claude.sessions[0].agentName).toBe('claude-code') // now stamped
    expect(loadStore(scopeProject(proj, 'OpenCode')).sessions).toHaveLength(0)
  })

  it('leaves genuine OpenCode (ses…) chats put when claude reclaims', () => {
    const proj = 'p'
    saveStore(
      scopeProject(proj, 'OpenCode'),
      upsertSession(emptyStore(), OPENCODE_ID, [msg(1, 'user', 'oc')], 100)
    )
    reclaimSessions(proj, 'claude-code')
    expect(
      loadStore(scopeProject(proj, 'OpenCode')).sessions.map((s) => s.id)
    ).toEqual([OPENCODE_ID])
    expect(loadStore(scopeProject(proj, 'claude-code')).sessions).toHaveLength(0)
  })

  it('never moves a STAMPED record, even if its id shape matches', () => {
    const proj = 'p'
    // a UUID-shaped chat explicitly owned by OpenCode — the stamp is authoritative
    saveStore(
      scopeProject(proj, 'OpenCode'),
      upsertSession(emptyStore(), CLAUDE_ID, [msg(1, 'user', 'x')], 100, 'OpenCode')
    )
    reclaimSessions(proj, 'claude-code')
    expect(
      loadStore(scopeProject(proj, 'OpenCode')).sessions.map((s) => s.id)
    ).toEqual([CLAUDE_ID])
    expect(loadStore(scopeProject(proj, 'claude-code')).sessions).toHaveLength(0)
  })

  it('is a no-op for an arbitrary future backend (no shape rule)', () => {
    const proj = 'p'
    saveStore(
      scopeProject(proj, 'OpenCode'),
      upsertSession(emptyStore(), CLAUDE_ID, [msg(1, 'user', 'x')], 100)
    )
    reclaimSessions(proj, 'FutureBot-9000')
    // nothing claimed; the unstamped chat stays where it was
    expect(
      loadStore(scopeProject(proj, 'OpenCode')).sessions.map((s) => s.id)
    ).toEqual([CLAUDE_ID])
    expect(loadStore(scopeProject(proj, 'FutureBot-9000')).sessions).toHaveLength(0)
  })

  it('backfills stamps on own-scope unstamped chats, and is idempotent', () => {
    const proj = 'p'
    saveStore(
      scopeProject(proj, 'claude-code'),
      upsertSession(emptyStore(), CLAUDE_ID, [msg(1, 'user', 'x')], 100)
    )
    reclaimSessions(proj, 'claude-code')
    const after1 = loadStore(scopeProject(proj, 'claude-code'))
    expect(after1.sessions[0].agentName).toBe('claude-code')
    reclaimSessions(proj, 'claude-code') // again — must not throw or change anything
    expect(loadStore(scopeProject(proj, 'claude-code')).sessions).toEqual(
      after1.sessions
    )
  })
})

describe('moveSession (manual re-home)', () => {
  beforeEach(() => localStorage.clear())

  it('moves a chat to another agent scope and stamps it', () => {
    const proj = 'p'
    saveStore(
      scopeProject(proj, 'OpenCode'),
      upsertSession(emptyStore(), CLAUDE_ID, [msg(1, 'user', 'x')], 100, 'OpenCode')
    )
    moveSession(proj, 'OpenCode', 'claude-code', CLAUDE_ID)

    expect(loadStore(scopeProject(proj, 'OpenCode')).sessions).toHaveLength(0)
    const claude = loadStore(scopeProject(proj, 'claude-code'))
    expect(claude.sessions.map((s) => s.id)).toEqual([CLAUDE_ID])
    expect(claude.sessions[0].agentName).toBe('claude-code')
  })

  it('is a no-op when source and target agents are the same or id is unknown', () => {
    const proj = 'p'
    saveStore(
      scopeProject(proj, 'OpenCode'),
      upsertSession(emptyStore(), OPENCODE_ID, [msg(1, 'user', 'x')], 100, 'OpenCode')
    )
    moveSession(proj, 'OpenCode', 'OpenCode', OPENCODE_ID) // same agent
    moveSession(proj, 'OpenCode', 'claude-code', 'nope') // unknown id
    expect(
      loadStore(scopeProject(proj, 'OpenCode')).sessions.map((s) => s.id)
    ).toEqual([OPENCODE_ID])
    expect(loadStore(scopeProject(proj, 'claude-code')).sessions).toHaveLength(0)
  })
})

describe('listScopedSessions (cross-agent grouping)', () => {
  beforeEach(() => localStorage.clear())

  it('groups a project’s chats by the owning agent', () => {
    const proj = 'proj1'
    saveStore(
      scopeProject(proj, 'claude-code'),
      upsertSession(emptyStore(), 'c1', [msg(1, 'user', 'from claude')], 100)
    )
    saveStore(
      scopeProject(proj, 'OpenCode'),
      upsertSession(emptyStore(), 'o1', [msg(1, 'user', 'from opencode')], 200)
    )

    const groups = listScopedSessions(proj)
    const byAgent = Object.fromEntries(
      groups.map((g) => [g.agentName, g.sessions.map((s) => s.id)])
    )
    expect(byAgent).toEqual({ 'claude-code': ['c1'], OpenCode: ['o1'] })
  })

  it('includes the bare (unscoped) store as a null-agent group', () => {
    const proj = 'proj1'
    saveStore(proj, upsertSession(emptyStore(), 'legacy', [msg(1, 'user', 'old')], 100))
    const groups = listScopedSessions(proj)
    expect(groups).toEqual([{ agentName: null, sessions: expect.any(Array) }])
    expect(groups[0].sessions.map((s) => s.id)).toEqual(['legacy'])
  })

  it('does not leak another project whose id shares this prefix', () => {
    saveStore('proj1', upsertSession(emptyStore(), 'a', [msg(1, 'user', 'a')], 100))
    // a different project id that starts with "proj1" must not be matched
    saveStore('proj10', upsertSession(emptyStore(), 'b', [msg(1, 'user', 'b')], 100))
    const groups = listScopedSessions('proj1')
    const ids = groups.flatMap((g) => g.sessions.map((s) => s.id))
    expect(ids).toEqual(['a'])
  })

  it('omits empty groups', () => {
    const proj = 'proj1'
    saveStore(scopeProject(proj, 'OpenCode'), emptyStore())
    saveStore(
      scopeProject(proj, 'claude-code'),
      upsertSession(emptyStore(), 'c1', [msg(1, 'user', 'hi')], 100)
    )
    const groups = listScopedSessions(proj)
    expect(groups.map((g) => g.agentName)).toEqual(['claude-code'])
  })
})
