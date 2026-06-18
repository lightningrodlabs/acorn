/**
 * awaitingEval — the "awaiting human evaluation" leaf state (loop-eval-signal).
 *
 * A leaf is awaiting human evaluation when its build work is done (it is a Small
 * leaf, not yet Achieved, with all its tasks checked) but at least one
 * human-evaluator completion criterion has not yet been confirmed. That is exactly
 * the moment the loop is waiting on a person, so it gets its own leaf colour.
 *
 * Pure (no canvas, no Redux): it reads only the outcome's description + computed
 * scope/achievement, so it is unit-testable and reused by both the leaf background
 * and its border.
 */
import {
  parseFields,
  hasUnconfirmedHumanCriterion,
  allCriteriaMet,
} from './outcomeFields'
import {
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from './types/outcome'

export interface AwaitingEvalInput {
  description?: string
  computedScope: ComputedScope
  computedAchievementStatus: {
    simple: ComputedSimpleAchievementStatus
    tasksTotal: number
    tasksAchieved: number
  }
}

/** Whether all of a leaf's tasks are checked (and there is at least one). */
function allTasksComplete(s: AwaitingEvalInput['computedAchievementStatus']): boolean {
  return s.tasksTotal > 0 && s.tasksAchieved === s.tasksTotal
}

export function isAwaitingHumanEvaluation(outcome: AwaitingEvalInput): boolean {
  if (outcome.computedScope !== ComputedScope.Small) return false
  if (
    outcome.computedAchievementStatus.simple ===
    ComputedSimpleAchievementStatus.Achieved
  ) {
    return false
  }
  if (!allTasksComplete(outcome.computedAchievementStatus)) return false
  return hasUnconfirmedHumanCriterion(parseFields(outcome.description || ''))
}

/**
 * Ready for final sign-off: the build work is done (Small leaf, not yet Achieved,
 * all tasks checked) and EVERY completion criterion is met — all the evidence is in,
 * the leaf just hasn't been marked Achieved. This is the gap between "criteria all
 * pass" and "Achieved" that exists until a computed-achievement layer flips it
 * automatically; it gets its own leaf colour so the ready-to-finalize moment is
 * visible. Mutually exclusive with isAwaitingHumanEvaluation (all-met vs any-unmet).
 */
export function isReadyForSignoff(outcome: AwaitingEvalInput): boolean {
  if (outcome.computedScope !== ComputedScope.Small) return false
  if (
    outcome.computedAchievementStatus.simple ===
    ComputedSimpleAchievementStatus.Achieved
  ) {
    return false
  }
  if (!allTasksComplete(outcome.computedAchievementStatus)) return false
  return allCriteriaMet(parseFields(outcome.description || ''))
}
