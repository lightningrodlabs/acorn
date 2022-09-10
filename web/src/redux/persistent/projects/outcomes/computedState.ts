import {
  ComputedAchievementStatus,
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
  Outcome,
} from '../../../../types'
import { WithActionHash } from '../../../../types/shared'

export function computeAchievementStatus(
  self: WithActionHash<Outcome>,
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

  const tasksAchieved =
    'Small' in self.scope
      ? self.scope.Small.taskList.reduce((memo, currentTask) => {
          return memo + (currentTask.complete ? 1 : 0)
        }, 0)
      : 0
  const tasksTotal =
    'Small' in self.scope ? self.scope.Small.taskList.length : 0
  let simple: ComputedSimpleAchievementStatus

  const needsProgressHasProgress =
    uncertains === 0 &&
    ((smallsTotal > 0 && smallsAchieved > 0 && smallsAchieved < smallsTotal) ||
      (tasksTotal > 0 && tasksAchieved > 0 && tasksAchieved < tasksTotal))

  const needsProgressHasNone =
    !(
      // manual marking of Achieved overrides computed status
      // when there are no children
      (
        uncertains === 0 &&
        smallsTotal === 0 &&
        'Small' in self.scope &&
        self.scope.Small.achievementStatus === 'Achieved'
      )
    ) &&
    (uncertains > 0 ||
      (smallsTotal > 0 && smallsAchieved === 0) ||
      (tasksTotal > 0 && tasksAchieved === 0))

  if (needsProgressHasProgress) {
    // represents a 'known' as opposed to 'uncertain'
    // amount of progress
    simple = ComputedSimpleAchievementStatus.PartiallyAchieved
  } else if (needsProgressHasNone) {
    simple = ComputedSimpleAchievementStatus.NotAchieved
  } else {
    simple = ComputedSimpleAchievementStatus.Achieved
  }

  return {
    uncertains,
    smallsAchieved,
    smallsTotal,
    tasksAchieved,
    tasksTotal,
    simple,
  }
}

export function computeScope(
  self: WithActionHash<Outcome>,
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
