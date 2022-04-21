import React from 'react'
import ButtonTabIcon from '../../ButtonTabIcon/ButtonTabIcon'

import Icon from '../../Icon/Icon'
import Typography from '../../Typography/Typography'
import { ExpandedViewTab } from '../NavEnum'

import './EVLeftColumn.scss'

export type EvLeftColumnProps = {
  outcomeId: number
  onChange: (expandedViewTab: ExpandedViewTab) => void
  activeTab: ExpandedViewTab
  commentCount: number
}

const EVLeftColumn: React.FC<EvLeftColumnProps> = ({
  outcomeId,
  onChange,
  activeTab,
  commentCount,
}) => {
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

  return (
    <div className="expanded-view-nav-column">
      <div className="expanded-view-outcome-id">
        {/* TODO: set typography */}
        <Typography style="caption1">{outcomeId.toString()}</Typography>
      </div>
      {navItems.map(({ text, icon }, index) => {
        return (
          <ButtonTabIcon
            key={index}
            label={text}
            iconName={icon}
            active={activeTab === index}
            onClick={() =>
              index !== ExpandedViewTab.ActivityHistory && onChange(index)
            }
          />
        )
      })}
    </div>
  )
}

export default EVLeftColumn
