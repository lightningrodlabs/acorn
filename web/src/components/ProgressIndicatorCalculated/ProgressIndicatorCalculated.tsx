import React from 'react'
import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../../types'
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator'
import './ProgressIndicatorCalculated.scss'

export type ProgressIndicatorCalculatedProps = {
  outcome: ComputedOutcome
  size?: 'small' | 'medium'
}

const ProgressIndicatorCalculated: React.FC<ProgressIndicatorCalculatedProps> = ({
  outcome, size = 'medium',
}) => {
  let progress = 0

  // TODO: refine this
  // because it can be confusing when task list progress
  // is out of sync with annotated 'Achieved' vs 'NotAchieved' achievement
  // status
  if (outcome.computedScope === ComputedScope.Small) {
    if (
      outcome.computedAchievementStatus.simple ===
      ComputedSimpleAchievementStatus.Achieved
    ) {
      // this is to account for the fact that manually setting
      // "Achieved" overrides the task list progress
      progress = 100
    } else if (
      outcome.computedAchievementStatus.tasksAchieved === 0 &&
      outcome.computedAchievementStatus.tasksTotal === 0
    ) {
      // avoid dividing 0 by 0
      progress = 0
    } else {
      progress =
        (outcome.computedAchievementStatus.tasksAchieved /
          outcome.computedAchievementStatus.tasksTotal) *
        100
    }
  } else {
    progress =
      (outcome.computedAchievementStatus.smallsAchieved /
        outcome.computedAchievementStatus.smallsTotal) *
      100
  }
  return <ProgressIndicator progress={progress} size={size} />
}

export default ProgressIndicatorCalculated
