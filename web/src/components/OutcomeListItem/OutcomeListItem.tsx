import React from 'react'
import { ComputedOutcome } from '../../types'
import Typography from '../Typography/Typography'
import './OutcomeListItem.scss'

export type OutcomeListItemProps = {
  outcome: ComputedOutcome
}

const OutcomeListItem: React.FC<OutcomeListItemProps> = ({ outcome }) => {
  return (
    <div className="outcome-list-item">
      {/* TODO: set typography */}
      <Typography style="caption1">{outcome.content}</Typography>
    </div>
  )
}

export default OutcomeListItem
