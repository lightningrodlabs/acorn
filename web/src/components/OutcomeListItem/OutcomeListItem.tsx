import React from 'react'
import { ComputedOutcome } from '../../types'
import Icon from '../Icon/Icon'
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator'
import Typography from '../Typography/Typography'
import './OutcomeListItem.scss'

export type OutcomeListItemProps = {
  outcome: ComputedOutcome
}

const OutcomeListItem: React.FC<OutcomeListItemProps> = ({ outcome }) => {
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

      {/* TODO: only show leaf icon for small scope children */}
      {/* Leaf (or not) */}
      <div className="outcome-list-item-icon-wrapper leaf">
        <Icon name="leaf.svg" className="not-hoverable" />
      </div>

      {/* ProgressIndicator */}
      <div className="outcome-list-item-icon-wrapper progress">
        <ProgressIndicator progress={progress} />
      </div>

      {/* Outcome statement text */}
      <div className="outcome-list-item-statement" title={outcome.content}>
        <Typography style="h7">{outcome.content}</Typography>
      </div>

      {/* TODO: on click switch icon function */}
      {/* Switch to hovered outcome child (on hover) */}
      <div className="outcome-list-item-switch-button">
        <Icon name="enter.svg" size="small" className="light-grey" />
      </div>
    </div>
  )
}

export default OutcomeListItem
