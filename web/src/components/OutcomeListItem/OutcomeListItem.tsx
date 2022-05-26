import React from 'react'
import { ComputedOutcome, ComputedScope } from '../../types'
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
  const progress =
    (outcome.computedAchievementStatus.smallsAchieved /
      outcome.computedAchievementStatus.smallsTotal) *
    100
  return (
    <div className="outcome-list-item">
      {/* ID */}
      {/* TODO: setup outcome id */}
      <div className="outcome-list-item-id">
        <Typography style="caption3">123411</Typography>
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
