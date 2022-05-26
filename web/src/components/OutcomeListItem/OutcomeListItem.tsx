import React from 'react'
import hashCodeId from '../../api/clientSideIdHash'
import { ComputedOutcome, ComputedScope, ComputedSimpleAchievementStatus } from '../../types'
import { HeaderHashB64 } from '../../types/shared'
import Icon from '../Icon/Icon'
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator'
import Typography from '../Typography/Typography'
import './OutcomeListItem.scss'

export type OutcomeListItemProps = {
  outcome: ComputedOutcome
  openExpandedView: (headerHash: HeaderHashB64) => void
}

const OutcomeListItem: React.FC<OutcomeListItemProps> = ({
  outcome,
  openExpandedView,
}) => {
  // TODO: refine this
  // because it can be confusing when task list progress
  // is out of sync with annotated 'Achieved' vs 'NotAchieved' achievement
  // status
  let progress: number
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
  return (
    <div className="outcome-list-item">
      {/* ID */}
      <div className="outcome-list-item-id">
        <Typography style="caption3">
          {hashCodeId(outcome.headerHash)}
        </Typography>
      </div>

      {/* ProgressIndicator */}
      <div className="outcome-list-item-icon-wrapper progress">
        <ProgressIndicator progress={progress} />
      </div>

      {/* only show leaf icon for small scope children */}
      {/* Leaf (or not) */}
      {outcome.computedScope === ComputedScope.Small && (
        <div className="outcome-list-item-icon-wrapper leaf">
          <Icon name="leaf.svg" className="not-hoverable" />
        </div>
      )}

      {/* Outcome statement text */}
      <div className="outcome-list-item-statement" title={outcome.content}>
        <Typography style="h7">{outcome.content}</Typography>
      </div>

      {/* on click navigate to the Expanded View mode for that Outcome */}
      {/* Visible only while hovered on this child Outcome */}
      <div
        className="outcome-list-item-switch-button"
        onClick={() => {
          openExpandedView(outcome.headerHash)
        }}
      >
        <Icon name="enter.svg" size="small" className="light-grey" />
      </div>
    </div>
  )
}

export default OutcomeListItem
