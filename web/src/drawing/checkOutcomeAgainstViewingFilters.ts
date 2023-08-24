import {
  ComputedOutcome,
  ComputedSimpleAchievementStatus,
  ComputedScope,
} from '../types'

export default function checkOutcomeAgainstViewingFilters(
  outcome: ComputedOutcome,
  hiddenSmalls: boolean,
  hiddenAchieved: boolean
): boolean {
  return !(
    (hiddenAchieved &&
      outcome.computedAchievementStatus.simple ===
        ComputedSimpleAchievementStatus.Achieved) ||
    (hiddenSmalls && outcome.computedScope === ComputedScope.Small)
  )
}
