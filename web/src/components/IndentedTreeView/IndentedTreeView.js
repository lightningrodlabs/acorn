import React, { useState, useEffect } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import Icon from '../Icon/Icon'
import StatusIcon from '../StatusIcon/StatusIcon'

import HierarchyIcon from '../HierarchyIcon/HierarchyIcon'

import './IndentedTreeView.css'

// Recursive because we don't know
// how deep the nesting goes
function NestedTreeGoal({ goal, level, filterText }) {
  level = level || 1
  // set expanded open by default only if
  // at the first or second level
  const [expanded, setExpanded] = useState(level < 3)

  const location = useLocation()

  const match =
    !filterText.length ||
    (goal.content && goal.content.toLowerCase().includes(filterText))

  const searchParams = new URLSearchParams(location.search)
  const isUsingGoalAsContext = searchParams.get('contextGoal') === goal.address

  return (
    <div className='indented-view-goal'>
      {match && (
        <div className='indented-view-goal-item'>
          <div className='indented-view-goal-item-arrow'>
            {goal.children.length > 0 && <Icon
              name={expanded ? 'line-angle-down.svg' : 'line-angle-right.svg'}
              size='very-small'
              className='grey'
              onClick={() => setExpanded(!expanded)}
            />}
            {goal.children.length == 0 && <div></div>}
          </div>

          <NavLink
            to={
              location.pathname +
              (isUsingGoalAsContext ? '' : `?contextGoal=${goal.address}`)
            }
            className='indented-view-goal-content'
            isActive={match => match && isUsingGoalAsContext}
          >
            {goal.hierarchy === 'NoHierarchy' ? (
              <StatusIcon
                status={goal.status}
                notHoverable
                hideTooltip
                className='indented-view-goal-content-status-color'
              />
            ) : (
              <HierarchyIcon
                size='very-small'
                hierarchy={goal.hierarchy}
                status={goal.status}
              />
            )}
            <div className='indented-view-goal-text'>{goal.content}</div>
          </NavLink>
        </div>
      )}
      {/* if there's a filter, expand everything */}
      {/* since only what matches the filter will show anyways */}
      {(filterText.length || expanded) && goal.children
        ? goal.children.map((childGoal, index) => (
          <div className='indented-view-nested-goal' key={index}>
            <NestedTreeGoal
              filterText={filterText}
              goal={childGoal}
              level={level + 1}
            />
          </div>
        ))
        : null}
    </div>
  )
}

const testGoalTrees = [
  {
    content: 'gg',
    children: [
      {
        content: 'tt',
        children: [
          {
            content: 'test'
          }
        ]
      },
      {
        content: 'xx'
      }
    ]
  }
]

const DEFAULT_WIDTH = 260
const MIN_WIDTH = 230
const MAX_WIDTH = 600
// associated with .indented-view-goals class
const INDENTED_VIEW_GOALS_MARGIN = 15

export default function IndentedTreeView({ goalTrees }) {
  const [filterText, setFilterText] = useState('')
  const [isResizing, setIsResizing] = useState(false)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [lastMouseXPosition, setLastMouseXPosition] = useState()

  useEffect(() => {
    const isNotResizing = () => setIsResizing(false)
    document.body.addEventListener('mouseup', isNotResizing)
    // for teardown, unbind event listeners
    return () => {
      document.body.removeEventListener('mouseup', isNotResizing)
    }
  }, [])

  // mouse move effect
  useEffect(() => {
    const resize = event => {
      if (isResizing) {
        if (lastMouseXPosition) {
          // clientX and clientY are standard properties
          // of mouse events, indicating position of the mouse on the screen
          // relative to the top left corner of the browser window
          const mouseXDiff = event.clientX - lastMouseXPosition
          const newWidth = width + mouseXDiff
          // check if the new width would be within a set of reasonable
          // boundaries, max and min
          if (MIN_WIDTH < newWidth && newWidth < MAX_WIDTH) {
            setWidth(newWidth)
          }
        }
      }
      setLastMouseXPosition(event.clientX)
    }
    document.body.addEventListener('mousemove', resize)

    // for teardown, unbind event listeners
    return () => {
      document.body.removeEventListener('mousemove', resize)
    }
  }, [width, isResizing, lastMouseXPosition])

  return (
    <div className='indented-view-wrapper' style={{ width: `${width}px` }}>
      <div className='indented-view-search'>
        <Icon name='search.svg' size='very-small' />
        <input
          type='text'
          onChange={e => setFilterText(e.target.value.toLowerCase())}
          value={filterText}
          placeholder='Search a card or subtree'
          autoFocus
        />
        {filterText !== '' && (
          <button
            onClick={() => {
              setFilterText('')
            }}
            className='clear-button'
          >
            clear
          </button>
        )}
      </div>
      <div
        className='indented-view-goals'
        style={{ width: `${width - INDENTED_VIEW_GOALS_MARGIN}px` }}
      >
        {/* {testGoalTrees.map(goal => (
          <NestedTreeGoal goal={goal} />
        ))} */}
        {goalTrees.map((goal, index) => (
          <NestedTreeGoal filterText={filterText} goal={goal} key={index} />
        ))}
      </div>
      <div
        className='indented-view-resizer'
        onMouseDown={() => setIsResizing(true)}
      />
    </div>
  )
}
