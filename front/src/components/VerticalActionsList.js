import React, { useState } from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import Icon from './Icon/Icon'
import StatusPicker from './StatusPicker'
import PeoplePicker from './PeoplePicker/PeoplePicker'
import DatePicker from './DatePicker/DatePicker'
import HierarchyPicker from './HierarchyPicker/HierarchyPicker'
import PriorityPicker from './PriorityPicker/PriorityPicker'
import StatusIcon from './StatusIcon/StatusIcon'

import { archiveGoalFully, updateGoal } from '../projects/goals/actions'
import { closeGoalForm } from '../goal-form/actions'
import Modal, { ModalContent } from './Modal/Modal'

function VerticalActionListItem({ onClick, label, icon }) {
  return (
    <div className='action_list_item' onClick={onClick}>
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
}) {
  const defaultViews = {
    status: false,
    squirrels: false,
    timeframe: false,
    priority: false,
    hierarchy: false,
  }
  const [viewsOpen, setViews] = useState(defaultViews)

  const innerUpdateGoal = key => val => {
    updateGoal(
      {
        ...goal,
        timestamp_updated: moment().unix(),
        [key]: val,
      },
      goalAddress
    )
  }

  const toggleView = key => {
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
      <div className='vertical_actions_list'>
        <VerticalActionListItem
          label='status'
          icon={<StatusIcon size='small' status={goal.status} hideTooltip />}
          onClick={() => toggleView('status')}
        />
        <VerticalActionListItem
          label='squirrels'
          icon={<Icon name='squirrel.svg' className='white not-hoverable' />}
          onClick={() => toggleView('squirrels')}
        />
        <VerticalActionListItem
          label='timeframe'
          icon={<Icon name='calendar.svg' className='white not-hoverable' />}
          onClick={() => toggleView('timeframe')}
        />
        <VerticalActionListItem
          label='hierarchy'
          icon={<Icon name='hierarchy.svg' className='white not-hoverable' />}
          onClick={() => toggleView('hierarchy')}
        />
        <VerticalActionListItem
          label='priority'
          icon={<Icon name='priority.svg' className='white not-hoverable' />}
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
        className='archive_popup'>
        <ModalContent
          heading='Archiving'
          content={archiveContent}
          icon='archive.svg'
          primaryButton='Yes, Archive'
          altButton='Nevermind'
          primaryButtonAction={() => onArchiveClick(goalAddress)}
          altButtonAction={() => setViews({ ...defaultViews })}
        />
      </Modal>
    </>
  )
}

VerticalActionsList.propTypes = {
  projectId: PropTypes.string,
  goalAddress: PropTypes.string.isRequired,
  goal: PropTypes.shape({
    content: PropTypes.string.isRequired,
    user_hash: PropTypes.string.isRequired,
    timestamp_created: PropTypes.number.isRequired,
    hierarchy: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onArchiveClick: PropTypes.func.isRequired,
  updateGoal: PropTypes.func.isRequired,
}

function mapStateToProps(state, ownProps) {
  const goalAddress = state.ui.goalForm.editAddress
  const { projectId } = ownProps
  const goals = state.projects.goals[projectId] || {}
  return {
    goalAddress,
    goal: goals[goalAddress],
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    onArchiveClick: payload => {
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
