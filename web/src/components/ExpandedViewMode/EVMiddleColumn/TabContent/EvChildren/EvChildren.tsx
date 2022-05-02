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
    <div className="ev-children-view-wrapper">
      <EvReadOnlyHeading
        headingText={outcomeContent}
        // @ts-ignore
        overviewIcon={<Icon name="hierarchy.svg" />}
        overviewText={`${directChildren.length} children`}
      />
      <div className="ev-children-view-outcome-list">
        {directChildren.map((outcome) => {
          return <OutcomeListItem key={outcome.headerHash} outcome={outcome} />
        })}
      </div>
    </div>
  )
}

export default EvChildren
