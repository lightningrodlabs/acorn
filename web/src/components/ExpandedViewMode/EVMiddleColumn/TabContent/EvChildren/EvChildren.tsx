import React from 'react'
import { ComputedOutcome } from '../../../../../types'
import { ActionHashB64 } from '../../../../../types/shared'
import EvReadOnlyHeading from '../../../../EvReadOnlyHeading/EvReadOnlyHeading'
import Icon from '../../../../Icon/Icon'
import OutcomeListItem from '../../../../OutcomeListItem/OutcomeListItem'
import './EvChildren.scss'

export type EvChildrenProps = {
  outcomeContent: string
  directChildren: ComputedOutcome[]
  openExpandedView: (actionHash: ActionHashB64) => void
}

const EvChildren: React.FC<EvChildrenProps> = ({
  outcomeContent,
  directChildren,
  openExpandedView,
}) => {
  return (
    <div className="ev-children-view-wrapper">
      <EvReadOnlyHeading
        headingText={outcomeContent}
        // @ts-ignore
        overviewIcon={<Icon name="hierarchy.svg" className="not-hoverable" />}
        overviewText={`${directChildren.length} child${
          directChildren.length > 1 ? 'ren' : ''
        }`}
      />
      <div className="ev-children-view-outcome-list">
        {directChildren.map((outcome) => {
          return (
            <OutcomeListItem
              key={outcome.actionHash}
              outcome={outcome}
              openExpandedView={openExpandedView}
            />
          )
        })}
      </div>
    </div>
  )
}

export default EvChildren
