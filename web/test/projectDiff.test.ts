import {
  computeProjectDiff,
  applyProjectDiff,
  isEmptyDiff,
  diffStats,
  touchedOutcomeHashes,
  findUnresolvedReferences,
  perOutcomeChangeStats,
  completeConnection,
  completeConnectionsInDiff,
  validateConnections,
  normalizeDiff,
  ProjectSnapshot,
  ProjectDiff,
} from '../src/migrating/projectDiff'

// minimal snapshot helpers
const outcome = (hash: string, content: string) => ({
  actionHash: hash,
  content,
  description: '',
})
const connection = (hash: string, parent: string, child: string) => ({
  actionHash: hash,
  parentActionHash: parent,
  childActionHash: child,
})

const snapshot = (overrides: ProjectSnapshot = {}): ProjectSnapshot => ({
  outcomes: {},
  connections: {},
  tags: {},
  outcomeMembers: {},
  outcomeComments: {},
  entryPoints: {},
  ...overrides,
})

describe('projectDiff', () => {
  test('computes added / updated / removed per collection', () => {
    const prev = snapshot({
      outcomes: { a: outcome('a', 'A'), b: outcome('b', 'B') },
    })
    const current = snapshot({
      outcomes: { a: outcome('a', 'A edited'), c: outcome('c', 'C') }, // b removed, c added, a updated
    })
    const diff = computeProjectDiff(prev, current)
    expect(Object.keys(diff.outcomes.added)).toEqual(['c'])
    expect(Object.keys(diff.outcomes.updated)).toEqual(['a'])
    expect(diff.outcomes.removed).toEqual(['b'])
  })

  test('an unchanged snapshot produces an empty diff', () => {
    const snap = snapshot({ outcomes: { a: outcome('a', 'A') } })
    expect(isEmptyDiff(computeProjectDiff(snap, snap))).toBe(true)
  })

  test('round-trip: applying the diff to prev reproduces current (the i1 criterion)', () => {
    const prev = snapshot({
      outcomes: { a: outcome('a', 'A'), b: outcome('b', 'B') },
      connections: { x: connection('x', 'a', 'b') },
    })
    const current = snapshot({
      outcomes: { a: outcome('a', 'A2'), c: outcome('c', 'C') },
      connections: { y: connection('y', 'a', 'c') },
    })
    const diff = computeProjectDiff(prev, current)
    expect(applyProjectDiff(prev, diff)).toEqual(current)
  })

  test('applying a diff is idempotent (the i2 criterion)', () => {
    const prev = snapshot({ outcomes: { a: outcome('a', 'A') } })
    const current = snapshot({ outcomes: { a: outcome('a', 'A2'), c: outcome('c', 'C') } })
    const diff = computeProjectDiff(prev, current)
    const once = applyProjectDiff(prev, diff)
    const twice = applyProjectDiff(once, diff)
    expect(twice).toEqual(once)
  })

  test('applyProjectDiff does not mutate the base snapshot', () => {
    const base = snapshot({ outcomes: { a: outcome('a', 'A') } })
    const diff = computeProjectDiff(base, snapshot({ outcomes: { a: outcome('a', 'A'), b: outcome('b', 'B') } }))
    applyProjectDiff(base, diff)
    expect(Object.keys(base.outcomes!)).toEqual(['a'])
  })

  test('touchedOutcomeHashes covers added/updated outcomes and changed connection endpoints (the i3 criterion)', () => {
    const prev = snapshot({ outcomes: { a: outcome('a', 'A') } })
    const current = snapshot({
      outcomes: { a: outcome('a', 'A'), b: outcome('b', 'B') }, // b added
      connections: { x: connection('x', 'a', 'b') }, // links a -> b
    })
    const diff = computeProjectDiff(prev, current)
    const touched = touchedOutcomeHashes(diff).sort()
    expect(touched).toEqual(['a', 'b']) // b added; a + b are the new connection endpoints
  })

  test('findUnresolvedReferences flags connection endpoints that point nowhere', () => {
    const base = snapshot({ outcomes: { a: outcome('a', 'A') } })
    const current = snapshot({
      outcomes: { a: outcome('a', 'A'), b: outcome('b', 'B') }, // b added
      connections: {
        ok: connection('ok', 'a', 'b'), // both resolve (a in base, b added)
        bad: connection('bad', 'a', 'ghost'), // ghost resolves to nothing
      },
    })
    const diff = computeProjectDiff(base, current)
    expect(findUnresolvedReferences(diff, base)).toEqual(['ghost'])
  })

  test('findUnresolvedReferences returns empty for a clean diff', () => {
    const base = snapshot({ outcomes: { a: outcome('a', 'A'), b: outcome('b', 'B') } })
    const current = snapshot({
      outcomes: { a: outcome('a', 'A'), b: outcome('b', 'B'), c: outcome('c', 'C') },
      connections: { x: connection('x', 'a', 'c') },
    })
    expect(findUnresolvedReferences(computeProjectDiff(base, current), base)).toEqual([])
  })

  describe('perOutcomeChangeStats (the i3b per-node badge)', () => {
    const small = (taskList: any[], achievementStatus = 'NotAchieved') => ({
      Small: { achievementStatus, targetDate: null, taskList },
    })

    test('a brand-new node is flagged isNew', () => {
      const base = snapshot({ outcomes: { a: outcome('a', 'A') } })
      const current = snapshot({
        outcomes: { a: outcome('a', 'A'), b: outcome('b', 'B') },
      })
      const stats = perOutcomeChangeStats(computeProjectDiff(base, current), base)
      expect(stats['b'].isNew).toBe(true)
    })

    test('counts task additions, edits (toggles), and removals by task text', () => {
      const prev = {
        ...outcome('a', 'A'),
        scope: small([
          { complete: false, task: 'keep' },
          { complete: false, task: 'toggle me' },
          { complete: false, task: 'drop me' },
        ]),
      }
      const next = {
        ...outcome('a', 'A'),
        scope: small([
          { complete: false, task: 'keep' },
          { complete: true, task: 'toggle me' },
          { complete: false, task: 'brand new' },
        ]),
      }
      const base = snapshot({ outcomes: { a: prev } })
      const diff = computeProjectDiff(base, snapshot({ outcomes: { a: next } }))
      expect(perOutcomeChangeStats(diff, base)['a']).toEqual({
        isNew: false,
        added: 1,
        updated: 1,
        removed: 1,
      })
    })

    test('counts clarity-field (description JSON key) changes individually', () => {
      const prev = {
        ...outcome('a', 'A'),
        description: JSON.stringify({ outcome: 'o', spec: 'old', gone: 1 }),
      }
      const next = {
        ...outcome('a', 'A'),
        description: JSON.stringify({ outcome: 'o', spec: 'new', criteria: [] }),
      }
      const base = snapshot({ outcomes: { a: prev } })
      const diff = computeProjectDiff(base, snapshot({ outcomes: { a: next } }))
      expect(perOutcomeChangeStats(diff, base)['a']).toEqual({
        isNew: false,
        added: 1, // criteria
        updated: 1, // spec
        removed: 1, // gone
      })
    })

    test('statement and achievement-status changes each count as one edit', () => {
      const prev = { ...outcome('a', 'A'), scope: small([]) }
      const next = {
        ...outcome('a', 'A renamed'),
        scope: small([], 'Achieved'),
      }
      const base = snapshot({ outcomes: { a: prev } })
      const diff = computeProjectDiff(base, snapshot({ outcomes: { a: next } }))
      expect(perOutcomeChangeStats(diff, base)['a'].updated).toBe(2)
    })

    test('a deleted node counts as a removal on its surviving parent', () => {
      const base = snapshot({
        outcomes: { p: outcome('p', 'parent'), c: outcome('c', 'child') },
        connections: { x: connection('x', 'p', 'c') },
      })
      const current = snapshot({ outcomes: { p: outcome('p', 'parent') } })
      const stats = perOutcomeChangeStats(computeProjectDiff(base, current), base)
      expect(stats['p']).toEqual({ isNew: false, added: 0, updated: 0, removed: 1 })
      expect(stats['c']).toBeUndefined() // nothing left to badge
    })

    test('a new child counts as an addition on its parent', () => {
      const base = snapshot({ outcomes: { p: outcome('p', 'parent') } })
      const current = snapshot({
        outcomes: { p: outcome('p', 'parent'), c: outcome('c', 'child') },
        connections: { x: connection('x', 'p', 'c') },
      })
      const stats = perOutcomeChangeStats(computeProjectDiff(base, current), base)
      expect(stats['p'].added).toBe(1)
      expect(stats['c'].isNew).toBe(true)
    })
  })

  test('diffStats reports per-collection counts', () => {
    const diff = computeProjectDiff(
      snapshot({ outcomes: { a: outcome('a', 'A'), b: outcome('b', 'B') } }),
      snapshot({ outcomes: { a: outcome('a', 'A2'), c: outcome('c', 'C') } })
    )
    expect(diffStats(diff).outcomes).toEqual({ added: 1, updated: 1, removed: 1 })
  })

  // Agent-authored connection hardening: the agent supplies parent/child/sibling
  // order; the system fills randomizer + isImported and rejects the malformed.
  describe('connection normalization + validation', () => {
    const diffWithConns = (added: any): ProjectDiff =>
      normalizeDiff({ connections: { added } })

    test('completeConnection fills the system-known fields, preserves supplied ones', () => {
      const out = completeConnection(
        { parentActionHash: 'p', childActionHash: 'c', siblingOrder: 3 },
        999
      )
      expect(out).toEqual({
        parentActionHash: 'p',
        childActionHash: 'c',
        siblingOrder: 3,
        randomizer: 999,
        isImported: false,
      })
    })

    test('completeConnection preserves an agent-supplied randomizer/isImported', () => {
      const out = completeConnection(
        { parentActionHash: 'p', childActionHash: 'c', randomizer: 7, isImported: true },
        999
      )
      expect(out.randomizer).toBe(7)
      expect(out.isImported).toBe(true)
      expect(out.siblingOrder).toBe(0) // defaulted when omitted
    })

    test('completeConnectionsInDiff gives each connection a distinct randomizer', () => {
      const diff = diffWithConns({
        x: { parentActionHash: 'p', childActionHash: 'a', siblingOrder: 0 },
        y: { parentActionHash: 'p', childActionHash: 'b', siblingOrder: 1 },
      })
      const out = completeConnectionsInDiff(diff, 1000)
      const rx = out.connections.added.x.randomizer
      const ry = out.connections.added.y.randomizer
      expect(typeof rx).toBe('number')
      expect(typeof ry).toBe('number')
      expect(rx).not.toBe(ry)
    })

    test('completeConnectionsInDiff is idempotent on an already-completed diff', () => {
      const once = completeConnectionsInDiff(
        diffWithConns({ x: { parentActionHash: 'p', childActionHash: 'c', siblingOrder: 0 } }),
        1000
      )
      const twice = completeConnectionsInDiff(once, 5555)
      expect(twice.connections.added.x).toEqual(once.connections.added.x)
    })

    test('an under-specified connection passes validation and completes to zome-valid shape', () => {
      // the executable criterion: a connection with only parent/child/siblingOrder
      const raw = diffWithConns({
        x: { parentActionHash: 'p', childActionHash: 'c', siblingOrder: 2 },
      })
      expect(validateConnections(raw)).toEqual([])
      const completed = completeConnectionsInDiff(raw, 1234)
      const conn = completed.connections.added.x
      // all five zome Connection fields present and well-typed
      expect(typeof conn.parentActionHash).toBe('string')
      expect(typeof conn.childActionHash).toBe('string')
      expect(typeof conn.siblingOrder).toBe('number')
      expect(typeof conn.randomizer).toBe('number')
      expect(typeof conn.isImported).toBe('boolean')
    })

    test('a connection missing its parent is rejected with a clear message', () => {
      const issues = validateConnections(
        diffWithConns({ x: { childActionHash: 'c', siblingOrder: 0 } })
      )
      expect(issues).toHaveLength(1)
      expect(issues[0].key).toBe('x')
      expect(issues[0].message).toMatch(/parent/i)
    })

    test('a connection missing its child is rejected', () => {
      const issues = validateConnections(
        diffWithConns({ x: { parentActionHash: 'p', siblingOrder: 0 } })
      )
      expect(issues.some((i) => /child/i.test(i.message))).toBe(true)
    })

    test('validation covers updated connections too', () => {
      const diff = normalizeDiff({
        connections: { updated: { u: { parentActionHash: 'p', siblingOrder: 0 } } },
      })
      expect(validateConnections(diff).some((i) => /child/i.test(i.message))).toBe(true)
    })

    test('a diff with no connections is valid', () => {
      expect(validateConnections(normalizeDiff({}))).toEqual([])
    })
  })
})
