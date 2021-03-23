import React from 'react'
import './ExpandedViewNavBar.css'

import Icon from '../../../Icon/Icon'

function ExpandedViewNavBar({ onChange, activeTab }) {
  const navItems = [
    // {
    // text: 'priority',
    // icon: 'priority.svg'
    // },
    {
      text: 'comments',
      icon: 'comment.svg',
    },
    {
      text: 'activity history',
      icon: 'activity-history.svg',
    },
    //{
    // text: 'attachments',
    // icon: 'attachment.svg'
    //},
  ]

  return (
    <div className='expanded-view-nav-bar'>
      {navItems.map(({ text, icon }, index) => {
        const activeClass = activeTab === text ? 'active-tab' : ''
        return (
          <div
            className={`expanded-view-nav-bar-item ${activeClass}`}
            key={index}
            onClick={() => onChange(text)}>
            <Icon name={icon} size='very-small' className='grey' />
            {text}
          </div>
        )
      })}
    </div>
  )
}

export default ExpandedViewNavBar
