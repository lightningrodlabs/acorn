import {
  computeProjectDiff,
  applyProjectDiff,
  isEmptyDiff,
  diffStats,
  touchedOutcomeHashes,
  ProjectSnapshot,
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

  test('diffStats reports per-collection counts', () => {
    const diff = computeProjectDiff(
      snapshot({ outcomes: { a: outcome('a', 'A'), b: outcome('b', 'B') } }),
      snapshot({ outcomes: { a: outcome('a', 'A2'), c: outcome('c', 'C') } })
    )
    expect(diffStats(diff).outcomes).toEqual({ added: 1, updated: 1, removed: 1 })
  })
})
