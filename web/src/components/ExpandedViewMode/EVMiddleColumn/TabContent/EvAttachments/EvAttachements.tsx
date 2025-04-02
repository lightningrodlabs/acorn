import React from 'react'
import EvReadOnlyHeading from '../../../../EvReadOnlyHeading/EvReadOnlyHeading'
import Icon from '../../../../Icon/Icon'
import OutcomeListItem from '../../../../OutcomeListItem/OutcomeListItem'
import './EvAttachments.scss'
import AddAttachment from './AddAttachment'

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
      <div className="ev-attachments-add-new">
        <AddAttachment onAddAttachment={() => {}} />
      </div>
    </div>
  )
}

export default EvAttachments
