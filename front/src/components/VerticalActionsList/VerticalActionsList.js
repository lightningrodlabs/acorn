import React, { useState } from 'react'
import moment from 'moment'
import { connect } from 'react-redux'

import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import layoutFormula from '../../drawing/layoutFormula'
import { goalWidth } from '../../drawing/dimensions'

import Icon from '../Icon/Icon'
import StatusPicker from '../StatusPicker'
import PeoplePicker from '../PeoplePicker/PeoplePicker'
import DatePicker from '../DatePicker/DatePicker'
import HierarchyPicker from '../HierarchyPicker/HierarchyPicker'
import PriorityPicker from '../PriorityPicker/PriorityPicker'
import StatusIcon from '../StatusIcon/StatusIcon'

import { archiveGoalFully, updateGoal } from '../../projects/goals/actions'
import { closeGoalForm } from '../../goal-form/actions'
import Modal, { ModalContent } from '../Modal/Modal'

import './VerticalActionsList.css'

function VerticalActionListItem({ onClick, label, icon }) {
  return (
    <div className="actions-list-item" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </div>
  )
}

function VerticalActionsList({
  projectId,
  goalAddress,
  goal,
  onArchiveClick,
  updateGoal,
  leftEdgeXPosition,
  topEdgeYPosition,
}) {
  const defaultViews = {
    status: false,
    squirrels: false,
    timeframe: false,
    priority: false,
    hierarchy: false,
  }
  const [viewsOpen, setViews] = useState(defaultViews)

  const innerUpdateGoal = (key) => (val) => {
    updateGoal(
      {
        ...goal,
        timestamp_updated: moment().unix(),
        [key]: val,
      },
      goalAddress
    )
  }

  const toggleView = (key) => {
    setViews({ ...defaultViews, [key]: !viewsOpen[key] })
  }

  const archiveContent = (
    <div>
      You're about to archive the card "<b>{goal.content}</b>
      ". You will be able to see this card in the archive view mode in the
      future. Proceed?
    </div>
  )

  // timeframe consts

  const updateTimeframe = (start, end) => {
    let timeframe = null

    if (start && end) {
      timeframe = {
        from_date: start,
        to_date: end,
      }
    }

    updateGoal(
      {
        ...goal,
        timestamp_updated: moment().unix(),
        time_frame: timeframe,
      },
      goalAddress
    )
  }

  const fromDate = goal.time_frame
    ? moment.unix(goal.time_frame.from_date)
    : null
  const toDate = goal.time_frame ? moment.unix(goal.time_frame.to_date) : null

  return (
    <>
      <div
        className="vertical-actions-list"
        style={{
          left: `${leftEdgeXPosition}px`,
          top: `${topEdgeYPosition}px`,
        }}
      >
        <VerticalActionListItem
          label="Status"
          icon={
            <StatusIcon size="very-small" status={goal.status} hideTooltip />
          }
          onClick={() => toggleView('status')}
        />
        <VerticalActionListItem
          label="Squirrels"
          icon={
            <Icon
              size="small"
              name="squirrel.svg"
              className="black not-hoverable"
            />
          }
          onClick={() => toggleView('squirrels')}
        />
        <VerticalActionListItem
          label="Timeframe"
          icon={
            <Icon
              size="small"
              name="calendar.svg"
              className="black not-hoverable"
            />
          }
          onClick={() => toggleView('timeframe')}
        />
        <VerticalActionListItem
          label="Hierarchy"
          icon={
            <Icon
              size="small"
              name="hierarchy.svg"
              className="black not-hoverable"
            />
          }
          onClick={() => toggleView('hierarchy')}
        />
        <VerticalActionListItem
          label="Priority"
          icon={
            <Icon
              size="small"
              name="priority.svg"
              className="black not-hoverable"
            />
          }
          onClick={() => toggleView('priority')}
        />
        {/* TODO : make the Alert Popup screen and certain elements */}
        {/* like Quick Edit Icon and Expand Icon not shrink after zooming out on canvas */}
        {/* fix the archive based popup, by moving it UP the render tree OUTSIDE the MapView, which
             gets zoomed in out as the map does */}
        {/* <VerticalActionListItem
          label='archive'
          icon={<Icon name='archive.svg' className='white not-hoverable' />}
          onClick={() => toggleView('archive')}
        /> */}
        {viewsOpen.status && (
          <StatusPicker
            projectId={projectId}
            selectedStatus={goal.status}
            statusClicked={innerUpdateGoal('status')}
            onClose={() => setViews({ ...defaultViews })}
          />
        )}
        {viewsOpen.squirrels && (
          <PeoplePicker
            projectId={projectId}
            onClose={() => setViews({ ...defaultViews })}
          />
        )}
        {viewsOpen.timeframe && (
          <DatePicker
            projectId={projectId}
            onClose={() => setViews({ ...defaultViews })}
            onSet={updateTimeframe}
            fromDate={fromDate}
            toDate={toDate}
          />
        )}
        {viewsOpen.hierarchy && (
          <HierarchyPicker
            projectId={projectId}
            onClose={() => setViews({ ...defaultViews })}
            selectedHierarchy={goal.hierarchy}
            hierarchyClicked={innerUpdateGoal('hierarchy')}
          />
        )}
        {viewsOpen.priority && (
          <PriorityPicker
            projectId={projectId}
            goalAddress={goalAddress}
            onClose={() => setViews({ ...defaultViews })}
          />
        )}
      </div>
      <Modal
        active={viewsOpen.archive}
        onClose={() => setViews({ ...defaultViews })}
        className="archive-popup"
      >
        <ModalContent
          heading="Archiving"
          content={archiveContent}
          icon="archive.svg"
          primaryButton="Yes, Archive"
          altButton="Nevermind"
          primaryButtonAction={() => onArchiveClick(goalAddress)}
          altButtonAction={() => setViews({ ...defaultViews })}
        />
      </Modal>
    </>
  )
}

function mapStateToProps(state, ownProps) {
  // goal address
  const goalAddress = state.ui.goalForm.editAddress
  // project ID
  const { projectId } = ownProps
  const goals = state.projects.goals[projectId] || {}

  // Figure out where is that goal on the canvas:
  // figure out where on the canvas the goal being edited is
  // located, according to the canvas coordinate system
  // x, y
  const width = state.ui.screensize.width
  const goalCoordinate = layoutFormula(width, state)[goalAddress]

  // Figure out where is that goal is relation to the window:
  // coordinates translation to css from canvas
  const translate = state.ui.viewport.translate
  const scale = state.ui.viewport.scale
  // position it at the right of the goal, by moving to the right
  // by the width of a Goal
  const cssCoordinates = coordsCanvasToPage(
    { x: (goalCoordinate.x + goalWidth), y: goalCoordinate.y },
    translate,
    scale
  )

  return {
    goalAddress,
    goal: goals[goalAddress],
    leftEdgeXPosition: cssCoordinates.x,
    topEdgeYPosition: cssCoordinates.y,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    onArchiveClick: (payload) => {
      return dispatch(archiveGoalFully.create({ cellIdString, payload }))
    },
    updateGoal: (entry, address) => {
      return dispatch(
        updateGoal.create({ cellIdString, payload: { address, entry } })
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VerticalActionsList)
