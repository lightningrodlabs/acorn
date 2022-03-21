import React from 'react'
import moment from 'moment'
import './ExpandedViewModeFooter.scss'

import Icon from '../../Icon/Icon'

export default function ExpandedViewModeFooter({ outcome, creator }) {
  return (
    <div className="expanded_view_footer">
      <div className="footer_children_info">
        {/* TODO make this a dynamically calculated value */}
        <div className="footer_leaf_completes feature-in-development">
          <Icon
            name="leaf_complete.svg"
            size="small"
            className="not-hoverable"
          />{' '}
          81/164
        </div>
        {/* TODO make this a dynamically calculated value */}
        <div className="footer_status_unknowns feature-in-development">
          <Icon
            name="status-unknown.svg"
            size="small"
            className="not-hoverable"
          />{' '}
          127
        </div>
      </div>
      <div className="footer_card_info">
        {`Created by ${creator.firstName} ${creator.lastName} ${
          creator.isImported ? '(Imported)' : ''
        }  ${moment.unix(outcome.timestampCreated).format(' | ll | LT')}`}
      </div>
    </div>
  )
}
