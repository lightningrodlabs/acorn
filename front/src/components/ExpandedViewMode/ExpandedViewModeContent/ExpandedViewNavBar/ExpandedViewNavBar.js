import React from 'react'
import './ExpandedViewNavBar.css'

import Icon from '../../../Icon/Icon'

function ExpandedViewNavBar({ onChange, activeTab, commentCount }) {
  const navItems = [
    {
      text: 'details',
      icon: 'comment.svg'
    },
    {
      text: `comments (${commentCount})`,
      icon: 'comment.svg',
    },
    {
      text: 'activity history',
      icon: 'activity-history.svg',
    },
  ]

  return (
    <div className='expanded-view-nav-bar'>
      {navItems.map(({ text, icon }, index) => {
        const activeClass = activeTab === index ? 'active-tab' : ''
        return (
          <div
            className={`expanded-view-nav-bar-item ${activeClass}`}
            key={index}
            onClick={() => onChange(index)}>
            <Icon name={icon} size='very-small' className='grey' />
            {text}
          </div>
        )
      })}
    </div>
  )
}

export default ExpandedViewNavBar
