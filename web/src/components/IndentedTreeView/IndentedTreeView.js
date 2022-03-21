import React, { useState, useEffect } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import Icon from '../Icon/Icon'
import StatusIcon from '../StatusIcon/StatusIcon'

import HierarchyIcon from '../HierarchyIcon/HierarchyIcon'

import './IndentedTreeView.scss'
import { PriorityModeOptions } from '../../constants'

// Recursive because we don't know
// how deep the nesting goes
function NestedTreeOutcome({ outcome, level, filterText, projectMeta, updateProjectMeta }) {
  level = level || 1
  // set expanded open by default only if
  // at the first or second level
  const [expanded, setExpanded] = useState(false)

  const location = useLocation()

  const match =
    !filterText.length ||
    (outcome.content && outcome.content.toLowerCase().includes(filterText))

  const searchParams = new URLSearchParams(location.search)
  const isUsingOutcomeAsContext = searchParams.get('contextOutcome') === outcome.headerHash
  const showMakeTopPriorityOutcome =
    projectMeta &&
    projectMeta.priorityMode === PriorityModeOptions.Universal &&
    !projectMeta.topPriorityOutcomes.find((headerHash) => headerHash === outcome.headerHash)
  const makeTopPriority = () => {
    const toPass = {
      ...projectMeta,
      topPriorityOutcomes: projectMeta.topPriorityOutcomes.concat([outcome.headerHash])
    }
    delete toPass.headerHash
    updateProjectMeta(toPass, projectMeta.headerHash)
  }

  return (
    <div className="indented-view-outcome">
      {match && (
        <div className="indented-view-outcome-item">
          <div className="indented-view-outcome-item-arrow">
            {outcome.children.length > 0 && (
              <Icon
                name={expanded ? 'chevron-down.svg' : 'chevron-right.svg'}
                size="small"
                className="grey"
                onClick={() => setExpanded(!expanded)}
              />
            )}
            {outcome.children.length == 0 && <div></div>}
          </div>

          <NavLink
            to={`${location.pathname}?contextOutcome=${outcome.headerHash}`}
            className="indented-view-outcome-content"
            isActive={(match) => match && isUsingOutcomeAsContext}
          >
            {outcome.hierarchy === 'NoHierarchy' ? (
              <StatusIcon
                status={outcome.status}
                notHoverable
                hideTooltip
                className="indented-view-outcome-content-status-color"
              />
            ) : (
              <HierarchyIcon
                size="very-small"
                hierarchy={outcome.hierarchy}
                status={outcome.status}
              />
            )}
            <div className="indented-view-outcome-text" title={outcome.content}>{outcome.content}</div>
            {showMakeTopPriorityOutcome && <div className="indented-view-outcome-make-top-priority" onClick={makeTopPriority}>
              <Icon
                name='plus.svg'
                size='small'
                className='grey'

              />
            </div>}
          </NavLink>
        </div>
      )}
      {/* if there's a filter, expand everything */}
      {/* since only what matches the filter will show anyways */}
      {(filterText.length || expanded) && outcome.children
        ? outcome.children.map((childOutcome, index) => (
          <div className="indented-view-nested-outcome" key={index}>
            <NestedTreeOutcome
              filterText={filterText}
              outcome={childOutcome}
              level={level + 1}
              projectMeta={projectMeta}
              updateProjectMeta={updateProjectMeta}
            />
          </div>
        ))
        : null}
    </div>
  )
}

const testOutcomeTrees = [
  {
    content: 'gg',
    children: [
      {
        content: 'tt',
        children: [
          {
            content: 'test',
          },
        ],
      },
      {
        content: 'xx',
      },
    ],
  },
]

const DEFAULT_WIDTH = 260
const MIN_WIDTH = 230
const MAX_WIDTH = 600
// associated with .indented-view-outcomes class
const INDENTED_VIEW_OUTCOMES_MARGIN = 15

export default function IndentedTreeView({ outcomeTrees, projectMeta, updateProjectMeta }) {
  const [filterText, setFilterText] = useState('')
  const [isResizing, setIsResizing] = useState(false)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [lastMouseXPosition, setLastMouseXPosition] = useState()

  const location = useLocation()

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
    const resize = (event) => {
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
    <div className="indented-view-wrapper" style={{ width: `${width}px` }}>
      {/* search/filter */}
      <div className="indented-view-search">
        <Icon name="search.svg" size="small" className="not-hoverable" />
        <input
          type="text"
          onChange={(e) => setFilterText(e.target.value.toLowerCase())}
          value={filterText}
          placeholder="Search for a outcome"
          autoFocus
        />
        {filterText !== '' && (
          <button
            onClick={() => {
              setFilterText('')
            }}
            className="clear-button"
          >
            clear
          </button>
        )}
      </div>
      {/* highest level view */}
      <NavLink
        to={location.pathname}
        className="highest-level-view"
        isActive={(match) => {
          const searchParams = new URLSearchParams(location.search)
          return match && !searchParams.get('contextOutcome')
        }}
      >
        Highest Level View
      </NavLink>
      {/* outcome items list */}
      <div
        className="indented-view-outcomes"
        style={{ width: `${width - INDENTED_VIEW_OUTCOMES_MARGIN}px` }}
      >
        {/* {testOutcomeTrees.map(outcome => (
          <NestedTreeOutcome outcome={outcome} />
        ))} */}
        {outcomeTrees.map((outcome, index) => (
          <NestedTreeOutcome
            filterText={filterText}
            outcome={outcome}
            key={index}
            projectMeta={projectMeta}
            updateProjectMeta={updateProjectMeta}
          />
        ))}
      </div>
      <div
        className="indented-view-resizer"
        onMouseDown={() => setIsResizing(true)}
      />
    </div>
  )
}
