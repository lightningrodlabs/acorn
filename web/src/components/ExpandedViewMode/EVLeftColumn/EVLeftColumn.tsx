import React from 'react'
import ButtonTabIcon from '../../ButtonTabIcon/ButtonTabIcon'
import Typography from '../../Typography/Typography'
import { ExpandedViewTab } from '../NavEnum'

import './EVLeftColumn.scss'

export type EvLeftColumnProps = {
  outcomeId: number
  onChange: (expandedViewTab: ExpandedViewTab) => void
  activeTab: ExpandedViewTab
  commentCount: number
  childrenCount: number
  taskListCount: number
}

const EVLeftColumn: React.FC<EvLeftColumnProps> = ({
  outcomeId,
  onChange,
  activeTab,
  commentCount,
  childrenCount,
  taskListCount,
}) => {
  const navItems = [
    {
      text: 'Details',
      icon: 'pencil.svg',
      tab: ExpandedViewTab.Details,
    },
    {
      text: `Comments (${commentCount})`,
      icon: 'comment.svg',
      tab: ExpandedViewTab.Comments,
    },
    {
      text:
        childrenCount > 0
          ? `Children (${childrenCount})`
          : `Task List (${taskListCount})`,
      // TODO: set icons
      icon: childrenCount > 0 ? 'hierarchy.svg' : 'x.svg',
      tab:
        childrenCount > 0 ? ExpandedViewTab.ChildrenList : ExpandedViewTab.TaskList,
    },
  ]

  return (
    <div className="expanded-view-nav-column">
      <div className="expanded-view-outcome-id">
        {/* TODO: set typography */}
        <Typography style="caption1">{outcomeId.toString()}</Typography>
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
