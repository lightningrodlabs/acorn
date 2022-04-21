import React from 'react'
import { ComputedOutcome } from '../../../../../types'
import EvReadOnlyHeading from '../../../../EvReadOnlyHeading/EvReadOnlyHeading'
import Icon from '../../../../Icon/Icon'
import OutcomeListItem from '../../../../OutcomeListItem/OutcomeListItem'
import './EvChildren.scss'

export type EvChildrenProps = {
  outcomeContent: string
  directChildren: ComputedOutcome[]
}

const EvChildren: React.FC<EvChildrenProps> = ({
  outcomeContent,
  directChildren,
}) => {
  return (
    <div className="ev-children">
      <EvReadOnlyHeading
        headingText={outcomeContent}
        // @ts-ignore
        overviewIcon={<Icon name="activity-history.svg" />}
        overviewText={`${directChildren.length} children`}
      />
      <div className="ev-children-outcome-list">
        {directChildren.map((outcome) => {
          return <OutcomeListItem key={outcome.headerHash} outcome={outcome} />
        })}
      </div>
    </div>
  )
}

export default EvChildren
