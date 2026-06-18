import {
  isAwaitingHumanEvaluation,
  isReadyForSignoff,
} from '../src/awaitingEval'
import { serializeFields } from '../src/outcomeFields'
import {
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../src/types/outcome'

const NotAchieved = ComputedSimpleAchievementStatus.NotAchieved
const Achieved = ComputedSimpleAchievementStatus.Achieved

// build a minimal AwaitingEvalInput
const node = (opts: {
  scope?: ComputedScope
  simple?: ComputedSimpleAchievementStatus
  tasksTotal?: number
  tasksAchieved?: number
  criteria?: any[]
}) => ({
  computedScope: opts.scope ?? ComputedScope.Small,
  computedAchievementStatus: {
    simple: opts.simple ?? NotAchieved,
    tasksTotal: opts.tasksTotal ?? 2,
    tasksAchieved: opts.tasksAchieved ?? 2,
    smallsAchieved: 0,
    smallsTotal: 0,
    uncertains: 0,
  },
  description: serializeFields({
    outcome: 'o',
    completionCriteria: opts.criteria ?? [{ statement: 's', evaluator: 'human' }],
  }),
})

describe('isAwaitingHumanEvaluation', () => {
  test('a Small leaf with all tasks done + an unconfirmed human criterion is awaiting', () => {
    expect(isAwaitingHumanEvaluation(node({}))).toBe(true)
  })

  test('not awaiting when tasks are incomplete (build work not done)', () => {
    expect(
      isAwaitingHumanEvaluation(node({ tasksAchieved: 1, tasksTotal: 2 }))
    ).toBe(false)
  })

  test('not awaiting when there are zero tasks (no build-work gate met)', () => {
    expect(
      isAwaitingHumanEvaluation(node({ tasksAchieved: 0, tasksTotal: 0 }))
    ).toBe(false)
  })

  test('not awaiting once the human criterion is confirmed', () => {
    expect(
      isAwaitingHumanEvaluation(
        node({ criteria: [{ statement: 's', evaluator: 'human', met: true }] })
      )
    ).toBe(false)
  })

  test('not awaiting when the only criterion is non-human', () => {
    expect(
      isAwaitingHumanEvaluation(
        node({ criteria: [{ statement: 's', evaluator: 'executable' }] })
      )
    ).toBe(false)
  })

  test('not awaiting when the leaf is already Achieved', () => {
    expect(isAwaitingHumanEvaluation(node({ simple: Achieved }))).toBe(false)
  })

  test('not awaiting for a non-Small (branch) node', () => {
    expect(isAwaitingHumanEvaluation(node({ scope: ComputedScope.Big }))).toBe(false)
  })
})

describe('isReadyForSignoff', () => {
  const allMet = [{ statement: 's', evaluator: 'human', met: true }]

  test('a Small leaf with all tasks done + every criterion met is ready for sign-off', () => {
    expect(isReadyForSignoff(node({ criteria: allMet }))).toBe(true)
  })

  test('mutually exclusive with awaiting-eval: a met-human node is ready, not awaiting', () => {
    const n = node({ criteria: allMet })
    expect(isReadyForSignoff(n)).toBe(true)
    expect(isAwaitingHumanEvaluation(n)).toBe(false)
  })

  test('not ready when any criterion is still unmet', () => {
    expect(
      isReadyForSignoff(
        node({
          criteria: [
            { statement: 'a', evaluator: 'human', met: true },
            { statement: 'b', evaluator: 'executable' },
          ],
        })
      )
    ).toBe(false)
  })

  test('not ready when tasks are incomplete (build work not done)', () => {
    expect(
      isReadyForSignoff(node({ criteria: allMet, tasksAchieved: 1, tasksTotal: 2 }))
    ).toBe(false)
  })

  test('not ready when there are no criteria at all', () => {
    expect(isReadyForSignoff(node({ criteria: [] }))).toBe(false)
  })

  test('not ready once the leaf is Achieved (it has moved past sign-off)', () => {
    expect(isReadyForSignoff(node({ criteria: allMet, simple: Achieved }))).toBe(false)
  })

  test('not ready for a non-Small (branch) node', () => {
    expect(
      isReadyForSignoff(node({ criteria: allMet, scope: ComputedScope.Big }))
    ).toBe(false)
  })
})
