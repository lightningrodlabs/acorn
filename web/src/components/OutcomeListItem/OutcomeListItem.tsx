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
      <Typography style="caption1">123411</Typography>

      {/* Leaf (or not) */}
      <Icon name='leaf.svg' />

      {/* ProgressIndicator */}
      <ProgressIndicator progress={0} />

      {/* Content */}
      {/* TODO: set typography */}
      <Typography style="caption1">{outcome.content}</Typography>
    </div>
  )
}

export default OutcomeListItem
