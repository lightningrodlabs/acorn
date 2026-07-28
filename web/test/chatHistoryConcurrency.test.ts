/**
 * chat-history-concurrency — the per-session v2 storage layout: concurrent
 * writers (two sessions persisting in one window, or two windows on one
 * project) can no longer last-write-wins clobber each other, because a writer
 * only ever touches the session record it owns. Covers the leaf's executable
 * criterion: "Two writers interleaving persists against the same project lose
 * no session and no turn."
 */
import {
  changedProjectForKey,
  ChatMessage,
  deleteSession,
  getCurrentId,
  getSessionMessages,
  loadStore,
  persistTurn,
  setCurrentSession,
  subscribeChatHistory,
} from '../src/harness/chatHistory'

const msg = (id: number, role: ChatMessage['role'], text: string): ChatMessage => ({
  id,
  role,
  text,
})

// The physical v2 key for a session record — duplicated here deliberately, so
// the tests can act as a SECOND WINDOW writing to shared storage directly.
const rawSessionKey = (projectId: string, id: string) =>
  `acorn:harnessChat:v2:${projectId}:s:${id}`

beforeEach(() => localStorage.clear())

describe('interleaved writers (the executable criterion)', () => {
  it('two sessions persisting interleaved turns lose no session and no turn', () => {
    const p = 'proj'
    const a: ChatMessage[] = []
    const b: ChatMessage[] = []
    for (let turn = 0; turn < 5; turn++) {
      a.push(msg(turn * 2 + 1, 'user', `A turn ${turn}`))
      persistTurn(p, 'A', [...a], 100 + turn)
      b.push(msg(turn * 2 + 2, 'user', `B turn ${turn}`))
      persistTurn(p, 'B', [...b], 200 + turn, null, null, true)
    }
    const store = loadStore(p)
    expect(store.sessions.map((s) => s.id).sort()).toEqual(['A', 'B'])
    expect(getSessionMessages(p, 'A').map((m) => m.text)).toEqual(
      a.map((m) => m.text)
    )
    expect(getSessionMessages(p, 'B').map((m) => m.text)).toEqual(
      b.map((m) => m.text)
    )
  })

  it("a stale writer cannot clobber another writer's session (per-session records)", () => {
    const p = 'proj'
    persistTurn(p, 'A', [msg(1, 'user', 'a1')], 100)
    persistTurn(p, 'B', [msg(2, 'user', 'b1')], 200)
    // ANOTHER WINDOW appends a turn to B by writing B's record directly —
    // this window has no in-memory knowledge of it (its last read is stale)
    const external = {
      id: 'B',
      title: 'b1',
      updatedAt: 300,
      messages: [msg(2, 'user', 'b1'), msg(3, 'agent', 'b2 from other window')],
    }
    localStorage.setItem(rawSessionKey(p, 'B'), JSON.stringify(external))
    // the stale writer persists A — under the v1 whole-store blob this write
    // carried its stale copy of B and silently dropped the other window's turn
    persistTurn(p, 'A', [msg(1, 'user', 'a1'), msg(4, 'agent', 'a2')], 400)
    expect(getSessionMessages(p, 'B').map((m) => m.text)).toEqual([
      'b1',
      'b2 from other window',
    ])
    expect(getSessionMessages(p, 'A').map((m) => m.text)).toEqual(['a1', 'a2'])
  })

  it('persistTurn touches only its own session key', () => {
    const p = 'proj'
    persistTurn(p, 'A', [msg(1, 'user', 'a1')], 100)
    persistTurn(p, 'B', [msg(2, 'user', 'b1')], 200)
    const bRawBefore = localStorage.getItem(rawSessionKey(p, 'B'))
    persistTurn(p, 'A', [msg(1, 'user', 'a1'), msg(3, 'agent', 'a2')], 300)
    // B's stored bytes are untouched — not even a rewrite of equal content
    expect(localStorage.getItem(rawSessionKey(p, 'B'))).toBe(bRawBefore)
  })
})

describe('current-session pointer under concurrent writers', () => {
  it('a background persist (keepCurrent) never steals the displayed chat', () => {
    const p = 'proj'
    persistTurn(p, 'A', [msg(1, 'user', 'a1')], 100)
    setCurrentSession(p, 'A')
    persistTurn(p, 'B', [msg(2, 'user', 'b1')], 200, null, null, true)
    expect(getCurrentId(p)).toBe('A')
    // a foreground persist does take the pointer
    persistTurn(p, 'B', [msg(2, 'user', 'b1'), msg(3, 'agent', 'b2')], 300)
    expect(getCurrentId(p)).toBe('B')
  })

  it('deleteSession removes only its record; the pointer clears if it pointed there', () => {
    const p = 'proj'
    persistTurn(p, 'A', [msg(1, 'user', 'a1')], 100)
    persistTurn(p, 'B', [msg(2, 'user', 'b1')], 200)
    deleteSession(p, 'B')
    expect(getCurrentId(p)).toBeNull()
    expect(loadStore(p).sessions.map((s) => s.id)).toEqual(['A'])
    expect(getSessionMessages(p, 'A').map((m) => m.text)).toEqual(['a1'])
  })
})

describe('v1 → v2 migration', () => {
  it('reads a v1 whole-store blob once, converts it, and loses nothing after', () => {
    const p = 'projV1'
    const v1 = {
      currentId: 'old',
      sessions: [
        {
          id: 'old',
          title: 'from v1',
          updatedAt: 50,
          messages: [msg(1, 'user', 'from v1')],
        },
      ],
    }
    localStorage.setItem(`acorn:harnessChat:v1:${p}`, JSON.stringify(v1))
    expect(getSessionMessages(p, 'old').map((m) => m.text)).toEqual(['from v1'])
    // migrated: the blob is gone, the per-session record exists
    expect(localStorage.getItem(`acorn:harnessChat:v1:${p}`)).toBeNull()
    expect(localStorage.getItem(rawSessionKey(p, 'old'))).not.toBeNull()
    // and a subsequent concurrent-style persist keeps the migrated session
    persistTurn(p, 'new', [msg(2, 'user', 'post-migration')], 100)
    expect(loadStore(p).sessions.map((s) => s.id).sort()).toEqual(['new', 'old'])
  })
})

describe('change notification (pickers stay live)', () => {
  it('notifies same-window subscribers on persist, and unsubscribe stops it', () => {
    const p = 'proj'
    const seen: string[] = []
    const unsubscribe = subscribeChatHistory((projectId) => seen.push(projectId))
    persistTurn(p, 'A', [msg(1, 'user', 'a1')], 100)
    expect(seen).toContain(p)
    const count = seen.length
    unsubscribe()
    persistTurn(p, 'A', [msg(1, 'user', 'a1'), msg(2, 'agent', 'a2')], 200)
    expect(seen.length).toBe(count)
  })

  it('maps a cross-window storage event key back to the scoped project id', () => {
    // the pure mapping the 'storage' listener uses for other windows' writes
    expect(changedProjectForKey(rawSessionKey('projX::agent', 'S1'))).toBe(
      'projX::agent'
    )
    expect(changedProjectForKey('acorn:harnessChat:v2:projY:cur')).toBe('projY')
    expect(changedProjectForKey('unrelated')).toBeNull()
    expect(changedProjectForKey(null)).toBeNull()
  })
})
