import React, { useState } from 'react'
import { ComputedOutcome } from '../../../../../types'
import { ActionHashB64 } from '../../../../../types/shared'
import AddOutcomeChildInput from '../../../../AddOutcomeChildInput/AddOutcomeChildInput'
import EvReadOnlyHeading from '../../../../EvReadOnlyHeading/EvReadOnlyHeading'
import Icon from '../../../../Icon/Icon'
import OutcomeListItem from '../../../../OutcomeListItem/OutcomeListItem'
import './EvChildren.scss'

export type EvChildrenProps = {
  outcomeContent: string
  directChildren: ComputedOutcome[]
  openExpandedView: (actionHash: ActionHashB64) => void
  onCreateChildOutcome: (newOutcomeText: string) => Promise<void>
}

const EvChildren: React.FC<EvChildrenProps> = ({
  outcomeContent,
  directChildren,
  openExpandedView,
  onCreateChildOutcome,
}) => {
  return (
    <div className="ev-children-view-wrapper">
      <EvReadOnlyHeading
        headingText={outcomeContent}
        overviewIcon={<Icon name="hierarchy.svg" className="not-hoverable" />}
        overviewText={`${directChildren.length} child${
          directChildren.length !== 1 ? 'ren' : ''
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
      <div className="ev-children-add-new-child">
        <AddOutcomeChildInput onCreateChildOutcome={onCreateChildOutcome} />
      </div>
    </div>
  )
}

export default EvChildren
