import React, { useState } from 'react'
import _ from 'lodash'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useHistory, useLocation } from 'react-router-dom'

import Avatar from '../../../../components/Avatar/Avatar'
import Icon from '../../../../components/Icon/Icon'
import TimeframeFormat from '../../../../components/TimeframeFormat'

import './PriorityUniversal.scss'

// an individual list item
function UniversalOutcome({
  liveIndex,
  outcome,
  openExpandedView,
  goToOutcome,
}) {
  return (
    <div className="universal-priority-outcomes-list-row">
      <div className="universal-priority-outcome-item-wrapper">
        <div className="universal-priority-outcome-item-number-status-title">
          <div className="universal-priority-number-wrapper">
            <div className="universal-priority-order-number">{liveIndex}.</div>{' '}
          </div>
          <div className="universal-priority-outcome-title-status">
            <div className="universal-priority-outcome-item-status">
              {/* TODO */}
            </div>

            <div className="universal-priority-outcome-item-title">
              {outcome.content}
            </div>
          </div>
        </div>
        <div className="universal-priority-outcome-item-metadata">
          <div className="universal-priority-outcome-item-members">
            {outcome.members.map((member) => {
              return (
                <div
                  className="universal-priority-outcome-item-member-avatar"
                  key={member.headerHash}
                >
                  <Avatar
                    firstName={member.firstName}
                    lastName={member.lastName}
                    avatarUrl={member.avatarUrl}
                    imported={member.isImported}
                    size="medium"
                    withWhiteBorder
                    withStatus
                    selfAssignedStatus={member.status}
                    withTooltip
                  />
                </div>
              )
            })}
          </div>
          <div className="universal-priority-outcome-item-date">
            <TimeframeFormat timeFrame={outcome.timeFrame} />
          </div>
        </div>
        <div className="universal-priority-outcome-item-buttons">
          <div
            className="universal-priority-outcome-item-button outcome-item-button-expand"
            onClick={() => openExpandedView(outcome.headerHash)}
          >
            {/* @ts-ignore */}
            <Icon name="expand.svg" size="small" className="grey" />
          </div>
          <div
            className="universal-priority-outcome-item-button outcome-item-button-map"
            onClick={() => goToOutcome(outcome.headerHash)}
          >
            {/* @ts-ignore */}
            <Icon name="map.svg" size="small" className="grey" />
          </div>
        </div>
      </div>

      <div className="universal-priority-outcome-item-border"></div>
    </div>
  )
}

// for PriorityUniversalDraggableOutcome
const getItemStyle = (isDragging, draggableStyle) => ({
  // change background colour if dragging
  background: isDragging ? '#F8F7F5' : 'white',
  borderRadius: isDragging ? '10px' : '0',
  // styles we need to apply on draggables
  ...draggableStyle,
})
// wraps an individual list item in a draggable wrapper
function PriorityUniversalDraggableOutcome({
  outcome,
  index,
  whileDraggingIndexes,
  openExpandedView,
  goToOutcome,
}) {
  let liveIndex
  if (!whileDraggingIndexes) {
    // no dragging happening
    liveIndex = index + 1
  } else if (whileDraggingIndexes.source === index) {
    // item being rendered IS the item being dragged
    liveIndex = whileDraggingIndexes.destination + 1
  } else if (
    index < whileDraggingIndexes.source &&
    index < whileDraggingIndexes.destination
  ) {
    // item is above the list than what is being dragged and where it
    // is being dragged to
    liveIndex = index + 1
  } else if (
    index > whileDraggingIndexes.source &&
    index <= whileDraggingIndexes.destination
  ) {
    liveIndex = index // means it has gained a spot
  } else if (
    index < whileDraggingIndexes.source &&
    index >= whileDraggingIndexes.destination
  ) {
    liveIndex = index + 2 // means it has lost a spots
  } else {
    liveIndex = index + 1
  }
  return (
    <Draggable
      key={outcome.headerHash}
      draggableId={outcome.headerHash}
      index={index}
    >
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
            <UniversalOutcome
              outcome={outcome}
              liveIndex={liveIndex}
              openExpandedView={openExpandedView}
              goToOutcome={goToOutcome}
            />
          </div>
        )
      }}
    </Draggable>
  )
}

// the area within which outcomes are droppable
function PriorityUniversalDroppable({
  outcomes,
  whileDraggingIndexes,
  openExpandedView,
  goToOutcome,
}) {
  return (
    <Droppable droppableId="droppable">
      {(provided, _snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="universal-priority-droppable-wrapper"
          style={{ overflow: 'scroll' }}
        >
          {outcomes.map((outcome, index) => (
            <PriorityUniversalDraggableOutcome
              key={outcome.headerHash}
              outcome={outcome}
              index={index}
              whileDraggingIndexes={whileDraggingIndexes}
              openExpandedView={openExpandedView}
              goToOutcome={goToOutcome}
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
  outcomes,
  projectMeta,
  projectId,
  updateProjectMeta,
  openExpandedView,
  goToOutcome,
}) {
  const history = useHistory()
  const location = useLocation()
  const navAndGoToOutcome = (headerHash) => {
    history.push(location.pathname.replace('priority', 'map'))
    goToOutcome(headerHash)
  }
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
      destination: update.destination.index,
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
      projectMeta.topPriorityOutcomes,
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
      topPriorityOutcomes: reordered,
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

  let topPriorityOutcomeAddresses = []
  if (pending) {
    // make sure we only try to pick
    // and render outcomes that exist or are
    // known about
    topPriorityOutcomeAddresses = pendingList.filter(
      (outcomeHeaderHash) => outcomes[outcomeHeaderHash]
    )
  } else if (projectMeta) {
    // make sure we only try to pick
    // and render outcomes that exist or are
    // known about
    topPriorityOutcomeAddresses = projectMeta.topPriorityOutcomes.filter(
      (outcomeHeaderHash) => outcomes[outcomeHeaderHash]
    )
  }
  const topPriorityOutcomes = topPriorityOutcomeAddresses.map(
    (outcomeHeaderHash) => outcomes[outcomeHeaderHash]
  )

  return (
    <div className="universal-priority-wrapper">
      <div className="universal-priority-header">
        <div className="universal-priority-heading">
          <h1>High Priority Outcomes ({topPriorityOutcomes.length})</h1>
        </div>
        <div className="universal-priority-subheading">
          <h4>
            Drag and drop the outcomes to sort their order of importance for you
            and your teammates.
          </h4>
        </div>
      </div>
      <div className="universal-priority-divider-line"></div>

      <div className="universal-priority-outcomes-list-wrapper">
        {topPriorityOutcomes.length === 0 && (
          <div className="top-priority-empty-state-wrapper">
            {/* TODO: fix image url */}
            <img
              src="img/intro-screen-image-4.svg"
              className="top-priority-empty-state-image"
            />
            <h4>
              You haven't marked any outcomes as top priority.
              <br />
              <a
                href="https://sprillow.gitbook.io/acorn-knowledge-base/outcomes/high-priority-outcomes"
                target="_blank"
              >
                Learn how to start prioritizing here.
              </a>{' '}
            </h4>
          </div>
        )}
        {topPriorityOutcomes.length !== 0 && (
          <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
            <PriorityUniversalDroppable
              outcomes={topPriorityOutcomes}
              whileDraggingIndexes={whileDraggingIndexes}
              openExpandedView={openExpandedView}
              goToOutcome={navAndGoToOutcome}
            />
          </DragDropContext>
        )}
      </div>
    </div>
  )
}

export default PriorityUniversal
