import React, { useState, useEffect } from 'react'
import moment from 'moment'
import './ExpandedViewModeHeader.scss'

import Icon from '../../Icon/Icon'
import HierarchyIcon from '../../HierarchyIcon/HierarchyIcon'
import StatusPicker from '../../StatusPicker'
import StatusIcon from '../../StatusIcon/StatusIcon'

export default function ExpandedViewModeHeader({
  agentAddress,
  outcomeAddress,
  outcome,
  updateOutcome,
  isEntryPoint,
  entryPointClickAction,
}) {
  const defaultViews = {
    status: false,
  }
  const [viewsOpen, setViews] = useState(defaultViews)

  useEffect(() => {
    if (!outcomeAddress) {
      setViews({ ...defaultViews })
    }
  }, [outcomeAddress])

  const updateOutcomeStatus = status => {
    updateOutcome(
      {
        ...outcome,
        userEditHash: agentAddress,
        timestampUpdated: moment().unix(),
        status,
      },
      outcomeAddress
    )
  }

  const entryPointToggleIcon = isEntryPoint
    ? 'door-open.svg'
    : 'door-closed.svg'

  return (
    <div className='expanded_view_header'>
      <div className='expanded_view_status_icon'>
        {outcome.hierarchy === 'NoHierarchy' ? (
          <StatusIcon
            status={outcome.status}
            notHoverable
            onClick={() =>
              setViews({ ...defaultViews, status: !viewsOpen.status })
            }
          />
        ) : (
          <HierarchyIcon
            hierarchy={outcome.hierarchy}
            status={outcome.status}
            size='medium'
            onClick={() =>
              setViews({ ...defaultViews, status: !viewsOpen.status })
            }
          />
        )}
      </div>
      {viewsOpen.status && (
        <StatusPicker
          selectedStatus={outcome.status}
          statusClicked={updateOutcomeStatus}
          onClose={() => setViews({ ...defaultViews })}
        />
      )}
      <Icon
        withTooltip
        tooltipText={
          isEntryPoint
            ? 'This outcome is an entry point'
            : 'This outcome is not an entry point'
        }
        onClick={entryPointClickAction}
        name={entryPointToggleIcon}
        className='entry-points-toggle'
        size='medium-expanded-view'
      />
      <Icon
        name='lock-closed.svg'
        className='edibility_permission feature-in-development'
        size='medium-expanded-view'
      />
      {/* <Icon
        name='eye.svg'
        className='visiblity feature-in-development'
        size='medium-expanded-view'
      /> */}
      <Icon
        name='notification.svg'
        className='follow feature-in-development'
        size='medium-expanded-view'
      />
    </div>
  )
}
