import React, { useState, useEffect } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import { ComputedOutcome, ComputedScope, ProjectMeta } from '../../types'

import Icon from '../Icon/Icon'

import './IndentedTreeView.scss'
import ExpandChevron from '../ExpandChevron/ExpandChevron'
import ProgressIndicatorCalculated from '../ProgressIndicatorCalculated/ProgressIndicatorCalculated'
import { ActionHashB64, WithActionHash } from '../../types/shared'

export type NestedTreeOutcomeProps = {
  outcome: ComputedOutcome
  level: number
  filterText: string
  expandByDefault: boolean
  projectMeta: WithActionHash<ProjectMeta>
  updateProjectMeta: (entry: ProjectMeta, actionHash: ActionHashB64) => Promise<void>
}

// Recursive because we don't know
// how deep the nesting goes
const NestedTreeOutcome: React.FC<NestedTreeOutcomeProps> = ({
  outcome,
  level,
  filterText,
  projectMeta,
  updateProjectMeta,
  expandByDefault,
}) => {
  // set expanded open by default only if
  // at the first or second level
  const [expanded, setExpanded] = useState(expandByDefault)

  const location = useLocation()

  const match =
    !filterText.length ||
    (outcome.content && outcome.content.toLowerCase().includes(filterText))

  const searchParams = new URLSearchParams(location.search)
  const isUsingOutcomeAsContext =
    searchParams.get('contextOutcome') === outcome.actionHash
  const showMakeTopPriorityOutcome =
    projectMeta &&
    !projectMeta.topPriorityOutcomes.find(
      (actionHash) => actionHash === outcome.actionHash
    )
  const makeTopPriority = () => {
    const toPass = {
      ...projectMeta,
      topPriorityOutcomes: projectMeta.topPriorityOutcomes.concat([
        outcome.actionHash,
      ]),
    }
    delete toPass.actionHash
    updateProjectMeta(toPass, projectMeta.actionHash)
  }

  return (
    <div className="indented-view-outcome">
      {match && (
        <div className="indented-view-outcome-item">
          <NavLink
            to={`${location.pathname}?contextOutcome=${outcome.actionHash}`}
            className="indented-view-outcome-content"
            isActive={(match) => match && isUsingOutcomeAsContext}
          >
            {/* This div adds the indentation */}
            {/* to the "IndentedTreeView" */}
            <div style={{ marginLeft: `${(level - 1) * 1.25}rem` }} />
            <div className="indented-view-outcome-metadata-left-slot">
              {/* Expand Chevron */}
              {outcome.children.length > 0 && (
                <ExpandChevron
                  size="small"
                  expanded={expanded}
                  onClick={() => {
                    setExpanded(!expanded)
                  }}
                />
              )}
              {/* Leaf Icon (or not) */}
              {outcome.children.length === 0 &&
                outcome.computedScope === ComputedScope.Small && (
                  <div className="outcome-statement-icon">
                    <Icon
                      name="leaf.svg"
                      className="not-hoverable"
                      size="very-small"
                    />
                  </div>
                )}
            </div>

            <div className="indented-view-outcome-metadata-right-slot">
              {/* Progress Indicator */}
              {outcome.computedScope !== ComputedScope.Uncertain && (
                <ProgressIndicatorCalculated outcome={outcome} size="small" />
              )}

              {/* Uncertain Icon (or not) */}
              {outcome.computedScope === ComputedScope.Uncertain && (
                <div className="outcome-statement-icon">
                  <Icon
                    name="uncertain.svg"
                    className="not-hoverable uncertain"
                    size="very-small"
                  />
                </div>
              )}
            </div>

            {/* Outcome statement text */}
            <div className="indented-view-outcome-text" title={outcome.content}>
              {outcome.content}
            </div>
            {showMakeTopPriorityOutcome && (
              <div
                className="indented-view-outcome-make-top-priority"
                onClick={makeTopPriority}
              >
                <Icon name="plus.svg" size="small" className="grey" />
              </div>
            )}
          </NavLink>
        </div>
      )}
      {/* if there's a filter, expand everything */}
      {/* since only what matches the filter will show anyways */}
      {(filterText.length || expanded) && outcome.children
        ? outcome.children.map((childOutcome, index) => (
            <NestedTreeOutcome
              key={childOutcome.actionHash}
              filterText={filterText}
              outcome={childOutcome}
              level={level + 1}
              projectMeta={projectMeta}
              updateProjectMeta={updateProjectMeta}
              expandByDefault={false}
            />
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

const DEFAULT_WIDTH = 300
const MIN_WIDTH = 230
const MAX_WIDTH = 600
// associated with .indented-view-outcomes class
const INDENTED_VIEW_OUTCOMES_MARGIN = 0

export type IndentedTreeViewProps = {
  outcomeTrees: ComputedOutcome[]
  projectMeta: WithActionHash<ProjectMeta>
  updateProjectMeta: (entry: ProjectMeta, actionHash: ActionHashB64) => Promise<void>
}

const IndentedTreeView: React.FC<IndentedTreeViewProps> = ({
  outcomeTrees,
  projectMeta,
  updateProjectMeta,
}) => {
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
          placeholder="Search for an Outcome"
          autoFocus
        />
        {filterText !== '' && (
          <button
            onClick={() => {
              setFilterText('')
            }}
            className="clear-button"
          >
            {/* @ts-ignore */}
            <Icon
              name="x.svg"
              size="small"
              className="light-grey not-hoverable"
              withTooltip
              tooltipText="Clear"
            />
          </button>
        )}
      </div>
      {/* highest level view */}
      {/* TODO: decide if we want to remove this logic */}
      {/* <NavLink
        to={location.pathname}
        className="highest-level-view"
        isActive={(match) => {
          const searchParams = new URLSearchParams(location.search)
          return match && !searchParams.get('contextOutcome')
        }}
      >
        Highest Level View
      </NavLink> */}
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
            key={`nested-tree-outcome-${outcome.actionHash}`}
            level={1}
            filterText={filterText}
            outcome={outcome}
            projectMeta={projectMeta}
            updateProjectMeta={updateProjectMeta}
            expandByDefault={outcomeTrees.length <= 10}
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

export default IndentedTreeView