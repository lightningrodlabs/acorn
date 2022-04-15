import React from 'react'
import './EVLeftColumn.scss'

import Icon from '../../Icon/Icon'

function EVLeftColumn({ onChange, activeTab, commentCount }) {
  const navItems = [
    {
      text: 'Details',
      icon: 'pencil.svg',
    },
    {
      text: 'tree view',
      icon: 'comment.svg',
    },
    {
      text: `Comments (${commentCount})`,
      icon: 'comment.svg',
    },
    {
      text: 'activity history',
      icon: 'activity-history.svg',
    },
  ]

  return (
    <div className="expanded-view-nav-bar">
      {navItems.map(({ text, icon }, index) => {
        const activeClass = activeTab === index ? 'active-tab' : ''
        return (
          <div
            className={`expanded-view-nav-bar-item ${activeClass} ${index === 2 ? 'feature-in-development' : ''
              }`}
            key={index}
            onClick={() => index !== 2 && onChange(index)}
          >
            <Icon name={icon} size="very-small" className="grey" />
            {text}
          </div>
        )
      })}
    </div>
  )
}

export default EVLeftColumn
