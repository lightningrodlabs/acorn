import React, { useState, useEffect } from 'react'
import './ExpandedViewModeHeader.css'

import Icon from '../../Icon/Icon'
import HierarchyIcon from '../../HierarchyIcon/HierarchyIcon'
import StatusPicker from '../../StatusPicker'
import StatusIcon from '../../StatusIcon/StatusIcon'
import moment from 'moment'
export default function ExpandedViewModeHeader({
  goalAddress,
  goal,
  updateGoal,
  isEntryPoint,
  entryPointClickAction,
}) {
  const defaultViews = {
    status: false,
  }
  const [viewsOpen, setViews] = useState(defaultViews)

  useEffect(() => {
    if (!goalAddress) {
      setViews({ ...defaultViews })
    }
  }, [goalAddress])

  const updateGoalStatus = status => {
    updateGoal(
      {
        ...goal,
        timestamp_updated: moment().unix(),
        status,
      },
      goalAddress
    )
  }

  const entryPointToggleIcon = isEntryPoint
    ? 'door-open.png'
    : 'door-closed.png'

  return (
    <div className='expanded_view_header'>
      <div className='expanded_view_status_icon'>
        {goal.hierarchy === 'NoHierarchy' ? (
          <StatusIcon
            status={goal.status}
            notHoverable
            onClick={() =>
              setViews({ ...defaultViews, status: !viewsOpen.status })
            }
          />
        ) : (
          <HierarchyIcon
            hierarchy={goal.hierarchy}
            status={goal.status}
            size='medium'
            onClick={() =>
              setViews({ ...defaultViews, status: !viewsOpen.status })
            }
          />
        )}
      </div>
      {viewsOpen.status && (
        <StatusPicker
          selectedStatus={goal.status}
          statusClicked={updateGoalStatus}
          onClose={() => setViews({ ...defaultViews })}
        />
      )}
      <Icon
        withTooltip
        tooltipText={
          isEntryPoint
            ? 'This goal is an entry point'
            : 'This goal is not an entry point'
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
      <Icon
        name='eye.svg'
        className='visiblity feature-in-development'
        size='medium-expanded-view'
      />
      <Icon
        name='notification.svg'
        className='follow feature-in-development'
        size='medium-expanded-view'
      />
    </div>
  )
}
