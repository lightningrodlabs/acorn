import React, { useContext, useState } from 'react'
import _ from 'lodash'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useHistory, useLocation } from 'react-router-dom'
import { AppAgentClient } from '@holochain/client'

import {
  ActionHashB64,
  AgentPubKeyB64,
  CellIdString,
  WithActionHash,
} from '../../../types/shared'
import {
  Tag,
  ComputedOutcome,
  ComputedScope,
  ProjectMeta,
} from '../../../types'
import ComputedOutcomeContext from '../../../context/ComputedOutcomeContext'
import Icon from '../../../components/Icon/Icon'
import ProgressIndicatorCalculated from '../../../components/ProgressIndicatorCalculated/ProgressIndicatorCalculated'
import Typography from '../../../components/Typography/Typography'
import AvatarsList from '../../../components/AvatarsList/AvatarsList'
import TagsList from '../../../components/TagsList/TagsList'
import IndentedTreeView from '../../../components/IndentedTreeView/IndentedTreeView'

import './PriorityView.scss'

export type UniversalOutcomeProps = {
  projectTags: WithActionHash<Tag>[]
  presentMembers: AgentPubKeyB64[]
  outcome: ComputedOutcome
  liveIndex
  openExpandedView: (outcomeActionHash: ActionHashB64) => void
  goToOutcome: (outcomeActionHash: ActionHashB64) => void
}

// an individual list item
const UniversalOutcome: React.FC<UniversalOutcomeProps> = ({
  liveIndex,
  outcome,
  presentMembers,
  openExpandedView,
  goToOutcome,
  projectTags,
}) => {
  return (
    <div className="universal-priority-outcomes-list-row">
      <div className="universal-priority-outcome-item-wrapper">
        <div className="universal-priority-outcome-item-number-status-title">
          <div className="universal-priority-number-wrapper">
            <div className="universal-priority-order-number">{liveIndex}.</div>{' '}
          </div>
          <div className="universal-priority-outcome-title-status">
            <div className="universal-priority-outcome-item-status">
              {/* Progress Indicator */}
              {outcome.computedScope !== ComputedScope.Uncertain && (
                <ProgressIndicatorCalculated
                  outcome={outcome}
                  size={'medium'}
                />
              )}

              {/* Uncertain Icon (or not) */}
              {outcome.computedScope === ComputedScope.Uncertain && (
                <div className="outcome-statement-icon">
                  <Icon
                    name="uncertain.svg"
                    className="not-hoverable uncertain"
                  />
                </div>
              )}

              {/* Leaf Icon (or not) */}
              {outcome.children.length === 0 &&
                outcome.computedScope === ComputedScope.Small && (
                  <div className="outcome-statement-icon">
                    <Icon name="leaf.svg" className="not-hoverable" />
                  </div>
                )}
            </div>
            <div className="outcome-item-statement-tags">
              {' '}
              {/* Outcome statement */}
              <div className="universal-priority-outcome-item-statement">
                {outcome.content}
              </div>
              {/* Outcome tags */}
              <div className="universal-priority-outcome-item-tags">
                <TagsList
                  tags={projectTags}
                  selectedTags={outcome.tags}
                  showAddTagButton={false}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="universal-priority-outcome-item-metadata">
          <AvatarsList
            showPresence
            profilesPresent={presentMembers}
            size="small"
            profiles={outcome.members}
            withStatus={false}
          />

          {/* TODO: fix and add time metadata display */}
          {/* Hiding time component here is a temp solution */}
          {/* <div className="universal-priority-outcome-item-date">
            <TimeframeFormat timeFrame={outcome.timeFrame} />
          </div> */}
        </div>
        <div className="universal-priority-outcome-item-buttons">
          <div
            className="universal-priority-outcome-item-button outcome-item-button-expand"
            onClick={() => openExpandedView(outcome.actionHash)}
          >
            <Icon
              name="expand.svg"
              size="small"
              className="light-grey"
              withTooltip
              tooltipText="Expand"
            />
          </div>
          <div
            className="universal-priority-outcome-item-button outcome-item-button-map"
            onClick={() => goToOutcome(outcome.actionHash)}
          >
            <Icon
              name="map.svg"
              size="small"
              className="light-grey"
              withTooltip
              tooltipText="Find in Map"
            />
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

export type PriorityUniversalDraggableOutcomeProps = {
  projectTags: WithActionHash<Tag>[]
  presentMembers: AgentPubKeyB64[]
  outcome: ComputedOutcome
  openExpandedView: (outcomeActionHash: ActionHashB64) => void
  goToOutcome: (outcomeActionHash: ActionHashB64) => void
  index
  whileDraggingIndexes
}

// wraps an individual list item in a draggable wrapper
const PriorityUniversalDraggableOutcome: React.FC<PriorityUniversalDraggableOutcomeProps> = ({
  outcome,
  index,
  presentMembers,
  whileDraggingIndexes,
  openExpandedView,
  goToOutcome,
  projectTags,
}) => {
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
      key={outcome.actionHash}
      draggableId={outcome.actionHash}
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
              presentMembers={presentMembers}
              outcome={outcome}
              liveIndex={liveIndex}
              openExpandedView={openExpandedView}
              goToOutcome={goToOutcome}
              projectTags={projectTags}
            />
          </div>
        )
      }}
    </Draggable>
  )
}

// the area within which outcomes are droppable
export type PriorityUniversalDroppableProps = {
  projectTags: WithActionHash<Tag>[]
  presentMembers: AgentPubKeyB64[]
  outcomes: ComputedOutcome[]
  openExpandedView: (outcomeActionHash: ActionHashB64) => void
  goToOutcome: (outcomeActionHash: ActionHashB64) => void
  whileDraggingIndexes
}
const PriorityUniversalDroppable: React.FC<PriorityUniversalDroppableProps> = ({
  outcomes,
  presentMembers,
  projectTags,
  whileDraggingIndexes,
  openExpandedView,
  goToOutcome,
}) => {
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
              key={outcome.actionHash}
              outcome={outcome}
              index={index}
              presentMembers={presentMembers}
              whileDraggingIndexes={whileDraggingIndexes}
              openExpandedView={openExpandedView}
              goToOutcome={goToOutcome}
              projectTags={projectTags}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

// the default export, and main high level component here

export type PriorityViewStateProps = {
  projectId: CellIdString
  projectMeta: WithActionHash<ProjectMeta>
  projectTags: WithActionHash<Tag>[]
  presentMembers: AgentPubKeyB64[]
}

export type PriorityViewDispatchProps = {
  updateProjectMeta: (
    projectMeta: ProjectMeta,
    actionHash: ActionHashB64,
    cellIdString: CellIdString
  ) => Promise<void>
  openExpandedView: (outcomeActionHash: ActionHashB64) => void
  goToOutcome: (outcomeActionHash: ActionHashB64) => void
}

export type PriorityViewOwnProps = {
  appWebsocket: AppAgentClient
}

export type PriorityViewProps = PriorityViewStateProps &
  PriorityViewDispatchProps &
  PriorityViewOwnProps

const PriorityView: React.FC<PriorityViewProps> = ({
  projectMeta,
  projectId,
  presentMembers,
  updateProjectMeta,
  openExpandedView,
  goToOutcome,
  projectTags,
}) => {
  const history = useHistory()
  const location = useLocation()
  const navAndGoToOutcome = (actionHash: ActionHashB64) => {
    history.push(location.pathname.replace('priority', 'map'))
    goToOutcome(actionHash)
  }

  const wrappedUpdateProjectMeta = (
    entry: ProjectMeta,
    actionHash: ActionHashB64
  ) => {
    return updateProjectMeta(entry, actionHash, projectId)
  }

  const { computedOutcomesKeyed, computedOutcomesAsTree } = useContext(
    ComputedOutcomeContext
  )
  /// will be { source: int, destination: int }
  // both are indexes, if set at all
  const [whileDraggingIndexes, setWhileDraggingIndexes] = useState(null)
  const [pending, setPending] = useState(false)
  // temporarily store the list order that
  // is being persisted to holochain during
  // an updateProjectMeta call, it will temporarily render from this during
  // pending->true status
  const [pendingList, setPendingList] = useState([])

  let topPriorityOutcomeAddresses: ActionHashB64[] = []
  if (pending) {
    // make sure we only try to pick
    // and render outcomes that exist or are
    // known about
    topPriorityOutcomeAddresses = pendingList.filter(
      (outcomeActionHash) => computedOutcomesKeyed[outcomeActionHash]
    )
  } else if (projectMeta) {
    // make sure we only try to pick
    // and render outcomes that exist or are
    // known about
    topPriorityOutcomeAddresses = projectMeta.topPriorityOutcomes.filter(
      (outcomeActionHash: ActionHashB64) =>
        computedOutcomesKeyed[outcomeActionHash]
    )
  }

  // a little function to help us with reordering the result
  const reorder = (
    list: ActionHashB64[],
    startIndex: number,
    endIndex: number
  ) => {
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
      topPriorityOutcomeAddresses,
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
    const projectMetaAddress = toPass.actionHash
    delete toPass.actionHash
    try {
      await updateProjectMeta(toPass, projectMetaAddress, projectId)
    } catch (e) {
      console.log(e)
      // TODO
    }
    setPending(false)
    setPendingList([])
  }

  const topPriorityOutcomes = topPriorityOutcomeAddresses.map(
    (outcomeActionHash) => computedOutcomesKeyed[outcomeActionHash]
  )

  return (
    <div className="priority-view-wrapper">
      <IndentedTreeView
        outcomeTrees={computedOutcomesAsTree}
        projectMeta={projectMeta}
        updateProjectMeta={wrappedUpdateProjectMeta}
      />
      <div className="universal-priority-wrapper">
        <div className="universal-priority-header">
          <div className="universal-priority-heading">
            <Typography style="h2">
              High Priority Outcomes ({topPriorityOutcomes.length})
            </Typography>
          </div>
          <div className="universal-priority-subheading">
            <Typography style="subtitle3">
              Drag and drop the outcomes to sort their order of importance for
              you and your teammates.
            </Typography>
          </div>
        </div>

        <div className="universal-priority-outcomes-list-wrapper">
          {topPriorityOutcomes.length === 0 && (
            <div className="top-priority-empty-state-wrapper">
              <img
                src="images/priority-view-empty-state.svg"
                className="top-priority-empty-state-image"
              />
              <Typography style="body1">
                You haven't marked any Outcomes as High Priority.
                <br />
                <a
                  href="https://docs.acorn.software/outcomes/high-priority-outcomes"
                  target="_blank"
                >
                  Learn how to start prioritizing.
                </a>{' '}
              </Typography>
            </div>
          )}
          {topPriorityOutcomes.length !== 0 && (
            <DragDropContext
              onDragEnd={onDragEnd}
              onDragUpdate={onDragUpdate}
              style={{ overflow: 'auto' }}
            >
              <PriorityUniversalDroppable
                presentMembers={presentMembers}
                outcomes={topPriorityOutcomes}
                whileDraggingIndexes={whileDraggingIndexes}
                openExpandedView={openExpandedView}
                goToOutcome={navAndGoToOutcome}
                projectTags={projectTags}
              />
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  )
}

export default PriorityView
