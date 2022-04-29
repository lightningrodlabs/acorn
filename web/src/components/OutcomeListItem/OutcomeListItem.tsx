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
  return (
    <div className="outcome-list-item">
      {/* ID */}
      {/* TODO: set typography */}
      {/* TODO: setup outcome id */}
      <div className="outcome-list-item-id">
        <Typography style="caption3">123411</Typography>
      </div>

      {/* Leaf (or not) */}
      <div className="outcome-list-item-icon-wrapper">
        <Icon name="leaf.svg" className="not-hoverable" />
      </div>

      {/* ProgressIndicator */}
      <div className="outcome-list-item-icon-wrapper">
        <ProgressIndicator progress={0} />
      </div>

      {/* Outcome statement text */}
      {/* TODO: set typography */}
      <div className="outcome-list-item-statement">
        <Typography style="h7">{outcome.content}</Typography>
      </div>
    </div>
  )
}

export default OutcomeListItem
