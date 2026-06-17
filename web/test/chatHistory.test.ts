import {
  ChatMessage,
  deriveTitle,
  emptySessionId,
  emptyStore,
  listSessions,
  pruneEmpty,
  removeSession,
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
