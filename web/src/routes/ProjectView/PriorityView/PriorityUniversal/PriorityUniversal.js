import React, { useState } from 'react'
import { connect } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import _ from 'lodash'
import { NavLink } from 'react-router-dom'

import './PriorityUniversal.css'

import { openExpandedView } from '../../../../expanded-view/actions'

import Avatar from '../../../../components/Avatar/Avatar'
import Icon from '../../../../components/Icon/Icon'
import StatusIcon from '../../../../components/StatusIcon/StatusIcon'
import { updateProjectMeta } from '../../../../projects/project-meta/actions'
import TimeframeFormat from '../../../../components/TimeframeFormat'
import GuidebookNavLink from '../../../../components/GuidebookNavLink/GuidebookNavLink'

// an individual list item
function UniversalGoal({ liveIndex, goal, openExpandedView }) {
  return (
    <div className="universal-priority-goals-list-row">
      <div className="universal-priority-goal-item-wrapper">
        <div className="universal-priority-number-wrapper">
          <div className="universal-priority-order-number">{liveIndex}.</div>{' '}
        </div>
        <div className="universal-priority-goal-title-status" >
          <div className="universal-priority-goal-item-status">
            <StatusIcon
              status={goal.status}
              notHoverable
              hideTooltip
              className="indented-view-goal-content-status-color"
            />
          </div>

          <div className="universal-priority-goal-item-title">{goal.content}</div>
        </div>
        <div className="universal-priority-goal-item-metadata">
          <div className="universal-priority-goal-item-members">
            {goal.members.map(member => {
              return <div className="universal-priority-goal-item-member-avatar" key={member.headerHash}>
                <Avatar
                  first_name={member.first_name}
                  last_name={member.last_name}
                  avatar_url={member.avatar_url}
                  imported={member.is_imported}
                  medium
                />
              </div>
            })}
          </div>
          <div className="universal-priority-goal-item-date">
            <TimeframeFormat timeFrame={goal.time_frame} />
          </div>
        </div>
        <div
          className="universal-priority-goal-item-expand"
          onClick={() => openExpandedView(goal.headerHash)}
        >
          <Icon name="expand.svg" size="small" className="grey" />
        </div>
      </div>

      <div className="universal-priority-goal-item-border"></div>
    </div>
  )
}

// for PriorityUniversalDraggableGoal
const getItemStyle = (isDragging, draggableStyle) => ({
  // change background colour if dragging
  background: isDragging ? '#F8F7F5' : 'white',
  borderRadius: isDragging ? '10px' : '0',
  // styles we need to apply on draggables
  ...draggableStyle,
})
// wraps an individual list item in a draggable wrapper
function PriorityUniversalDraggableGoal({ goal, index, whileDraggingIndexes, openExpandedView }) {
  let liveIndex
  if (!whileDraggingIndexes) {
    // no dragging happening
    liveIndex = index + 1
  } else if (whileDraggingIndexes.source === index) {
    // item being rendered IS the item being dragged
    liveIndex = whileDraggingIndexes.destination + 1
  } else if (index < whileDraggingIndexes.source && index < whileDraggingIndexes.destination) {
    // item is above the list than what is being dragged and where it
    // is being dragged to
    liveIndex = index + 1
  } else if (index > whileDraggingIndexes.source && index <= whileDraggingIndexes.destination) {
    liveIndex = index // means it has gained a spot
  } else if (index < whileDraggingIndexes.source && index >= whileDraggingIndexes.destination) {
    liveIndex = index + 2 // means it has lost a spots
  } else {
    liveIndex = index + 1
  }
  return (
    <Draggable key={goal.headerHash} draggableId={goal.headerHash} index={index}>
      {(provided, snapshot) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
          >
            <UniversalGoal
              goal={goal}
              liveIndex={liveIndex}
              openExpandedView={openExpandedView}
            />
          </div>
        )
      }}
    </Draggable>
  )
}

// the area within which goals are droppable
function PriorityUniversalDroppable({ goals, whileDraggingIndexes, openExpandedView }) {
  return (
    <Droppable droppableId="droppable">
      {(provided, _snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="universal-priority-droppable-wrapper"
          style={{ overflow: 'scroll' }}
        >
          {goals.map((goal, index) => (
            <PriorityUniversalDraggableGoal
              key={goal.headerHash}
              goal={goal}
              index={index}
              whileDraggingIndexes={whileDraggingIndexes}
              openExpandedView={openExpandedView}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

// the default export, and main high level component here
function PriorityUniversal({
  goals,
  projectMeta,
  projectId,
  updateProjectMeta,
  openExpandedView,
}) {
  /// will be { source: int, destination: int }
  // both are indexes, if set at all
  const [whileDraggingIndexes, setWhileDraggingIndexes] = useState(null)
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
  const onDragUpdate = (update) => {
    setWhileDraggingIndexes({
      source: update.source.index,
      destination: update.destination.index
    })
  }
  const onDragEnd = async (result) => {
    setWhileDraggingIndexes(null)
    if (pending) return
    // dropped outside the list
    if (!result.destination) {
      return
    }
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
      top_priority_goals: reordered,
    }
    const projectMetaAddress = toPass.headerHash
    delete toPass.headerHash
    try {
      await updateProjectMeta(toPass, projectMetaAddress, projectId)
    } catch (e) {
      console.log(e)
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
    topPriorityGoalAddresses = pendingList.filter(
      (goalAddress) => goals[goalAddress]
    )
  } else if (projectMeta) {
    // make sure we only try to pick
    // and render goals that exist or are
    // known about
    topPriorityGoalAddresses = projectMeta.top_priority_goals.filter(
      (goalAddress) => goals[goalAddress]
    )
  }
  const topPriorityGoals = topPriorityGoalAddresses.map(
    (goalAddress) => goals[goalAddress]
  )

  return (
    <div className="universal-priority-wrapper">
      <div className="universal-priority-header">
        <div className="universal-priority-heading">
          <h1>Top Priority Goals ({topPriorityGoals.length})</h1>
        </div>
        <div className="universal-priority-subheading">
          <h4>
            Drag and drop the goals to sort their order of importance for you
            and your teammates.
          </h4>
        </div>
      </div>
      <div className="universal-priority-divider-line"></div>

      <div className="universal-priority-goals-list-wrapper">
        {topPriorityGoals.length === 0 && <div className="top-priority-empty-state-wrapper">
          <img src="img/intro-screen-image-4.svg" className="top-priority-empty-state-image" />
          <h4>You haven't marked any goals as top priority.
            <br />
            <GuidebookNavLink guidebookId='intro_universal_priority_mode'>Learn how to start prioritizing here.</GuidebookNavLink> </h4></div>}
        {topPriorityGoals.length !== 0 &&
          <DragDropContext
            onDragEnd={onDragEnd}
            onDragUpdate={onDragUpdate}
          >
            <PriorityUniversalDroppable
              goals={topPriorityGoals}
              whileDraggingIndexes={whileDraggingIndexes}
              openExpandedView={openExpandedView}
            />
          </DragDropContext>
        }
      </div>
    </div>
  )
}

function mapStateToProps(state) {
  const projectId = state.ui.activeProject
  const agents = state.agents
  const goals = state.projects.goals[projectId] || {}
  const goalMembers = state.projects.goalMembers[projectId] || {}
  const projectMeta = state.projects.projectMeta[projectId]

  // add members on to goal state objects
  const allGoalsArray = Object.values(goals).map(goal => {
    const extensions = {}
    extensions.members = Object.values(goalMembers)
      .filter(goalMember => goalMember.goal_address === goal.headerHash)
      .map(goalMember => agents[goalMember.agent_address])
      .filter(goalMember => goalMember) // filter out undefined results
    return {
      ...goal,
      ...extensions,
    }
  })
  const allGoals = _.keyBy(allGoalsArray, 'headerHash')

  return {
    projectId,
    projectMeta,
    goals: allGoals,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    openExpandedView: (address) => dispatch(openExpandedView(headerHash)),
    updateProjectMeta: (projectMeta, headerHash, cellIdString) => {
      return dispatch(
        updateProjectMeta.create({
          cellIdString,
          payload: {
            entry: projectMeta,
            headerHash,
          },
        })
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityUniversal)
