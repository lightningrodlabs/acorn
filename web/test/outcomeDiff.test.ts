import { outcomeFieldChanges } from '../src/components/DraftReviewPanel/outcomeDiff'

// L3 — the PR-style field-level diff the review panel renders. Pure: (committed,
// proposed) → the list of changed fields with before/after.

const fields = (o: object) => JSON.stringify({ outcome: '', ...o })

describe('outcomeFieldChanges', () => {
  test('a renamed node reports a Name change', () => {
    const prev = { content: 'Old name', description: fields({ outcome: 'x' }) }
    const next = { content: 'New name', description: fields({ outcome: 'x' }) }
    const changes = outcomeFieldChanges(prev, next)
    const name = changes.find((c) => c.label === 'Name')
    expect(name).toMatchObject({ kind: 'changed', before: 'Old name', after: 'New name' })
  })

  test('an added clarity field shows as added (no before)', () => {
    const prev = { content: 'n', description: fields({ outcome: 'goal' }) }
    const next = { content: 'n', description: fields({ outcome: 'goal', spec: 'do it' }) }
    const changes = outcomeFieldChanges(prev, next)
    const spec = changes.find((c) => c.label === 'Spec')
    expect(spec).toMatchObject({ kind: 'added', before: '', after: 'do it' })
  })

  test('a fully new node (prev=null) reports its name + fields as added', () => {
    const next = { content: 'Brand new', description: fields({ outcome: 'the goal' }) }
    const changes = outcomeFieldChanges(null, next)
    expect(changes.find((c) => c.label === 'Name')).toMatchObject({
      kind: 'added',
      after: 'Brand new',
    })
    expect(changes.find((c) => c.label === 'Outcome')).toMatchObject({
      kind: 'added',
      after: 'the goal',
    })
  })

  test('no change yields an empty list', () => {
    const o = { content: 'same', description: fields({ outcome: 'same' }) }
    expect(outcomeFieldChanges(o, { ...o })).toEqual([])
  })

  test('a newly-completed task is reported', () => {
    const prev = {
      content: 'n',
      description: fields({}),
      scope: { Small: { taskList: [{ task: 'ship', complete: false }] } },
    }
    const next = {
      content: 'n',
      description: fields({}),
      scope: { Small: { taskList: [{ task: 'ship', complete: true }] } },
    }
    const changes = outcomeFieldChanges(prev, next)
    const task = changes.find((c) => c.label === 'Task')
    expect(task?.kind).toBe('changed')
    expect(task?.after).toContain('ship')
  })
})
