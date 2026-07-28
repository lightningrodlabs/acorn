/**
 * Guard for sample-imports/acorn-clarity-trees-living-spec-tree.json — the
 * exported clarity tree that GUIDES the concurrent-sessions work and gets
 * HAND-EDITED at the end of every phase (tasks checked off, leaves marked
 * Achieved, criteria added). A bookkeeping typo here would silently corrupt
 * the tree on its next import; this suite makes the edit loop safe:
 *
 *   1. the file still validates against the exact schema the import path
 *      parses with (BackwardsCompatibleProjectExportSchema), and
 *   2. the graph is intact — every connection joins two real outcomes, and
 *      the concurrent-sessions branch keeps its parent + leaves reachable.
 */
import { BackwardsCompatibleProjectExportSchema } from 'zod-models'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tree = require('../../sample-imports/acorn-clarity-trees-living-spec-tree.json')

// the concurrent-sessions branch, by content (hand-edits touch scope/tasks,
// never these headline contents — if one changes, this list is the reminder
// that the guard must be updated WITH it)
const PARENT =
  /switches between concurrent agent sessions while work is in progress/
const LEAVES = [
  /Multiple sessions run turns concurrently in one window/,
  /Editing the live tree while agents work is safe/,
  /queue in a per-session attention inbox/,
  /proposed draft is reviewed independently/,
  /scoped to a region of the tree/,
  /across windows and across trees/,
]

const outcomes: Record<string, any> = tree.outcomes
const connections: Record<string, any> = tree.connections

const findByContent = (re: RegExp) =>
  Object.entries(outcomes).find(([, o]) => re.test(o.content))

describe('the living-spec tree export', () => {
  it('parses with the exact schema the import path uses', () => {
    const parsed = BackwardsCompatibleProjectExportSchema.safeParse(tree)
    if (!parsed.success)
      throw new Error(
        `schema violations (would fail on import):\n${parsed.error.issues
          .slice(0, 10)
          .map((i) => `• ${i.path.join('.')}: ${i.message}`)
          .join('\n')}`
      )
  })

  it('has no connection referencing a missing outcome', () => {
    const dangling = Object.values(connections)
      .filter(
        (c: any) =>
          !(c.parentActionHash in outcomes) || !(c.childActionHash in outcomes)
      )
      .map((c: any) => `${c.parentActionHash} → ${c.childActionHash}`)
    expect(dangling).toEqual([])
  })

  it('has no duplicate parent→child edge', () => {
    const seen = new Set<string>()
    const dupes: string[] = []
    for (const c of Object.values(connections) as any[]) {
      const key = `${c.parentActionHash}→${c.childActionHash}`
      if (seen.has(key)) dupes.push(key)
      seen.add(key)
    }
    expect(dupes).toEqual([])
  })

  it('keeps the concurrent-sessions branch intact: parent + 6 leaves, connected', () => {
    const parent = findByContent(PARENT)
    expect(parent).toBeDefined()
    const [parentHash] = parent!
    const childHashes = new Set(
      Object.values(connections)
        .filter((c: any) => c.parentActionHash === parentHash)
        .map((c: any) => c.childActionHash)
    )
    for (const leafRe of LEAVES) {
      const leaf = findByContent(leafRe)
      expect(leaf).toBeDefined()
      const [leafHash, leafOutcome] = leaf!
      // reachable as an explicit child edge — composed-of must be edges, not prose
      expect(childHashes.has(leafHash)).toBe(true)
      // a leaf carries a Small scope with a task list (the phase checklists);
      // this is the shape the phase-end hand-edit mutates, so pin it
      expect(leafOutcome.scope).toHaveProperty('Small')
      expect(Array.isArray(leafOutcome.scope.Small.taskList)).toBe(true)
      expect(leafOutcome.scope.Small.taskList.length).toBeGreaterThan(0)
      for (const t of leafOutcome.scope.Small.taskList) {
        expect(typeof t.complete).toBe('boolean')
        expect(typeof t.task).toBe('string')
      }
      expect(['Achieved', 'NotAchieved']).toContain(
        leafOutcome.scope.Small.achievementStatus
      )
    }
  })

  it('marks no leaf Achieved while its tasks are still open', () => {
    // the bookkeeping invariant for the phase-end edit: Achieved ⇒ every task
    // checked. (Checked tasks with NotAchieved is fine — criteria may lag.)
    const offenders = Object.values(outcomes)
      .filter((o: any) => o.scope?.Small?.achievementStatus === 'Achieved')
      .filter((o: any) =>
        (o.scope.Small.taskList || []).some((t: any) => !t.complete)
      )
      .map((o: any) => o.content.slice(0, 60))
    expect(offenders).toEqual([])
  })
})
