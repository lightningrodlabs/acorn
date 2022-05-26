import React from 'react'
import ButtonTabIcon from '../../ButtonTabIcon/ButtonTabIcon'
import Typography from '../../Typography/Typography'
import { ExpandedViewTab } from '../NavEnum'

import './EVLeftColumn.scss'

export type EvLeftColumnProps = {
  outcomeId: string
  onChange: (expandedViewTab: ExpandedViewTab) => void
  activeTab: ExpandedViewTab
  commentCount: number
  childrenCount: number
  taskListCount: number
  showTaskList: boolean
}

const EVLeftColumn: React.FC<EvLeftColumnProps> = ({
  outcomeId,
  onChange,
  activeTab,
  commentCount,
  childrenCount,
  taskListCount,
  showTaskList,
}) => {
  const navItems = [
    {
      text: 'Details',
      icon: 'details.svg',
      tab: ExpandedViewTab.Details,
    },
    {
      text: `Comments (${commentCount})`,
      icon: 'chats-circle.svg',
      tab: ExpandedViewTab.Comments,
    },
    ,
  ]

  if (childrenCount > 0) {
    navItems.push({
      text: `Children (${childrenCount})`,
      icon: 'hierarchy.svg',
      tab: ExpandedViewTab.ChildrenList,
    })
  } else if (showTaskList) {
    navItems.push({
      text: `Task List (${taskListCount})`,
      icon: 'squares-check.svg',
      tab: ExpandedViewTab.TaskList,
    })
  }

  return (
    <div className="expanded-view-nav-column">
      <div className="expanded-view-outcome-id">
        <Typography style="caption1">{outcomeId}</Typography>
      </div>
      {navItems.map(({ text, icon, tab }) => {
        return (
          <ButtonTabIcon
            key={`tab-${tab}`}
            label={text}
            iconName={icon}
            active={activeTab === tab}
            onClick={() => onChange(tab)}
          />
        )
      })}
    </div>
  )
}

export default EVLeftColumn
