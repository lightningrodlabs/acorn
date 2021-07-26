import React, { useState, useEffect } from 'react'
import {
  NavLink,
  useLocation,
  useParams,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import { connect } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import _ from 'lodash'

import './PriorityUniversal.css'

import Avatar from '../../../../components/Avatar/Avatar'
import goalsAsTrees from '../../../../projects/goals/goalsAsTrees'
import Icon from '../../../../components/Icon/Icon'
import StatusIcon from '../../../../components/StatusIcon/StatusIcon'
import { updateProjectMeta } from '../../../../projects/project-meta/actions'

function UniversalGoal({ goal }) {
  return <div className='universal-priority-goals-list-row'>
    <div className='universal-priority-goal-item-wrapper'>
      <div className='universal-priority-goal-item-status'>
        <StatusIcon
          status={goal.status}
          notHoverable
          hideTooltip
          className='indented-view-goal-content-status-color'
        /></div>
      <div className='universal-priority-goal-item-title'>{goal.content}</div>
      <div className='universal-priority-goal-item-metadata'>
        <Avatar
          first_name="Pegah"
          last_name="Vaezi"
          avatar_url="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fprofile.alumnius.net%2F226519719.jpg&f=1&nofb=1"
          small
        />
        <div className='universal-priority-goal-item-date'>Aug 12 - 16, 2021</div>
      </div>
    </div>
    <div className='universal-priority-goal-item-border'></div>
  </div>
}

// for PriorityUniversalDraggableGoal
const getItemStyle = (isDragging, draggableStyle) => ({
  // change background colour if dragging
  background: isDragging ? "#FCF9F9" : "white",
  borderRadius: isDragging ? "10px" : "0",
  // styles we need to apply on draggables
  ...draggableStyle
})
function PriorityUniversalDraggableGoal({ goal, index }) {
  return <Draggable key={goal.address} draggableId={goal.address} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={getItemStyle(
          snapshot.isDragging,
          provided.draggableProps.style
        )}
      >
        <UniversalGoal goal={goal} />
      </div>
    )}
  </Draggable>
}

function PriorityUniversalDroppable({ goals }) {
  return <Droppable droppableId="droppable">
    {(provided, _snapshot) => (
      <div
        {...provided.droppableProps}
        ref={provided.innerRef}
      >
        {goals.map((goal, index) => (
          <PriorityUniversalDraggableGoal goal={goal} index={index} />
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
}

function PriorityUniversal(
  { goals, projectMeta, projectId, updateProjectMeta }
) {
  const [pending, setPending] = useState(false)
  // temporarily store the list order that
  // is being persisted to holochain during
  // an updateProjectMeta call, it will temporarily render from this during
  // pending->true status
  const [pendingList, setPendingList] = useState([])
  // a little function to help us with reordering the result
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }
  const onDragEnd = async (result) => {
    if (pending) return
    // dropped outside the list
    if (!result.destination) return
    setPending(true)
    const reordered = reorder(
      projectMeta.top_priority_goals,
      result.source.index,
      result.destination.index
    )
    // cache it locally for display purposes
    // while the call is going through
    setPendingList(reordered)
    // make a clone of the state object
    // for modifying and passing to the api
    const toPass = {
      ...projectMeta,
      // assign new ordering
      top_priority_goals: reordered
    }
    const projectMetaAddress = toPass.address
    delete toPass.address
    try {
      await updateProjectMeta(toPass, projectMetaAddress, projectId)
    } catch (e) {
      // TODO
    }
    setPending(false)
    setPendingList([])
  }

  let topPriorityGoalAddresses = []
  if (pending) {
    // make sure we only try to pick
    // and render goals that exist or are
    // known about
    topPriorityGoalAddresses = pendingList.filter(goalAddress => goals[goalAddress])
  } else if (projectMeta) {
    // make sure we only try to pick
    // and render goals that exist or are
    // known about
    topPriorityGoalAddresses = projectMeta.top_priority_goals
      .filter(goalAddress => goals[goalAddress])
  }
  const topPriorityGoals = topPriorityGoalAddresses.map(goalAddress => goals[goalAddress])

  return (
    <div className='universal-priority-wrapper'>
      <div className='universal-priority-header'>
        <div className='universal-priority-heading'><h1>Top Priority Goals ({topPriorityGoals.length})</h1></div >
        <div className='universal-priority-subheading'><h4>Drag and drop the goals to sort their order of importance for you and your teammates.</h4></div>
      </div>
      <div className='universal-priority-divider-line'></div>
      <div className='universal-priority-goals-list-wrapper'>
        <div className='universal-priority-number-slots'>
          {topPriorityGoals.map((_g, index) => <div key={index} className='universal-priority-order-number'>{index + 1}.</div>)}
        </div>
        <div className='universal-priority-goal-slots'>
          <DragDropContext onDragEnd={onDragEnd}>
            <PriorityUniversalDroppable goals={topPriorityGoals} />
          </DragDropContext>
        </div>
      </div>
    </div>
  )
}

function mapStateToProps(state) {
  const projectId = state.ui.activeProject
  const goals = state.projects.goals[projectId] || {}
  const projectMeta = state.projects.projectMeta[projectId]
  return {
    projectId,
    projectMeta,
    goals
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateProjectMeta: (projectMeta, address, cellIdString) => {
      return dispatch(updateProjectMeta.create({
        cellIdString,
        payload: {
          entry: projectMeta,
          address
        }
      }))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityUniversal)
