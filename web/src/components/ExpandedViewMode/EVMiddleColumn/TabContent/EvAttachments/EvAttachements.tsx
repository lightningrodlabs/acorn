import React, { useState } from 'react'
import { ComputedOutcome } from '../../../../../types'
import { ActionHashB64 } from '../../../../../types/shared'
import AddOutcomeChildInput from '../../../../AddOutcomeChildInput/AddOutcomeChildInput'
import EvReadOnlyHeading from '../../../../EvReadOnlyHeading/EvReadOnlyHeading'
import Icon from '../../../../Icon/Icon'
import OutcomeListItem from '../../../../OutcomeListItem/OutcomeListItem'
import './EvAttachments.scss'

export type EvAttachmentsProps = {
  outcomeContent: string
}

const EvAttachments: React.FC<EvAttachmentsProps> = ({ outcomeContent }) => {
  return (
    <div className="ev-children-view-wrapper">
      <EvReadOnlyHeading
        headingText={outcomeContent}
        overviewIcon={<Icon name="attachment.svg" className="not-hoverable" />}
        overviewText={`attachments`}
      />
      <div className="ev-children-view-outcome-list">
        {[].map((outcome) => {
          return (
            <OutcomeListItem
              key={outcome.actionHash}
              outcome={outcome}
              openExpandedView={() => {}}
            />
          )
        })}
      </div>
      <div className="ev-children-add-new-child">
        <AddOutcomeChildInput onCreateChildOutcome={async () => {}} />
      </div>
    </div>
  )
}

export default EvAttachments
