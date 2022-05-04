import {
  ComputedAchievementStatus,
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
  Outcome,
} from '../../../../types'
import { WithHeaderHash } from '../../../../types/shared'

export function computeAchievementStatus(
  self: WithHeaderHash<Outcome>,
  children: ComputedOutcome[]
): ComputedAchievementStatus {
  // calculate the number of descendants for the 3
  // categories: uncertains, smallsAchieved, smallsTotal
  // when there are children, derive it from that
  // when there are no children, derive it directly from
  // the annotated state
  const uncertains =
    children.length > 0
      ? children.reduce((memo, currentValue) => {
          return memo + currentValue.computedAchievementStatus.uncertains
        }, 0)
      : 'Uncertain' in self.scope
      ? 1
      : 0
  const smallsAchieved =
    children.length > 0
      ? children.reduce((memo, currentValue) => {
          return memo + currentValue.computedAchievementStatus.smallsAchieved
        }, 0)
      : 'Small' in self.scope &&
        self.scope.Small.achievementStatus === 'Achieved'
      ? 1
      : 0
  const smallsTotal =
    children.length > 0
      ? children.reduce((memo, currentValue) => {
          return memo + currentValue.computedAchievementStatus.smallsTotal
        }, 0)
      : 'Small' in self.scope
      ? 1
      : 0
  let simple: ComputedSimpleAchievementStatus
  if (
    uncertains > 0 ||
    ('Small' in self.scope &&
      self.scope.Small.achievementStatus === 'NotAchieved')
  ) {
    simple = ComputedSimpleAchievementStatus.NotAchieved
  } else if (smallsAchieved === smallsTotal) {
    simple = ComputedSimpleAchievementStatus.Achieved
  } else {
    simple = ComputedSimpleAchievementStatus.PartiallyAchieved
  }

  return {
    uncertains,
    smallsAchieved,
    smallsTotal,
    simple,
  }
}

export function computeScope(
  self: WithHeaderHash<Outcome>,
  children: ComputedOutcome[]
): ComputedScope {
  // if it has no children,
  // use the 'annotated' value
  if (children.length === 0) {
    if ('Small' in self.scope) {
      return ComputedScope.Small
    } else if ('Uncertain' in self.scope) {
      return ComputedScope.Uncertain
    }
  }
  // if it has children, override annotated values
  // with computed values
  else {
    const hasUncertainChild = children.find(
      (child) => child.computedScope === ComputedScope.Uncertain
    )
    if (hasUncertainChild) {
      return ComputedScope.Uncertain
    } else {
      return ComputedScope.Big
    }
  }
}
