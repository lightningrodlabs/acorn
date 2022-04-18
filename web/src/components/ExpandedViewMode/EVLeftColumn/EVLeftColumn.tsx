import React from 'react'
import './EVLeftColumn.scss'

import Icon from '../../Icon/Icon'
import { ExpandedViewTab } from '../NavEnum'

function EVLeftColumn({ onChange, activeTab, commentCount }) {
  const navItems = [
    {
      text: 'Details',
      icon: 'pencil.svg',
    },
    {
      text: `Comments (${commentCount})`,
      icon: 'comment.svg',
    },
    {
      text: 'tree view',
      icon: 'comment.svg',
    },
    {
      text: 'activity history',
      icon: 'activity-history.svg',
    },
  ]

  const outcomeId = 124354

  return (
    <div className="expanded-view-nav-column">
      <div className='expanded-view-outcome-id'>{outcomeId}</div>
      {navItems.map(({ text, icon }, index) => {
        const activeClass = activeTab === index ? 'active-tab' : ''
        return (
          <div
            className={`expanded-view-nav-column-item ${activeClass} ${
              index === ExpandedViewTab.ActivityHistory
                ? 'feature-in-development'
                : ''
            }`}
            key={index}
            onClick={() =>
              index !== ExpandedViewTab.ActivityHistory && onChange(index)
            }
          >
            <Icon name={icon} size="small" className="grey" />
            {/* TODO: add tooltip text */}
            {/* {text} */}
          </div>
        )
      })}
    </div>
  )
}

export default EVLeftColumn
