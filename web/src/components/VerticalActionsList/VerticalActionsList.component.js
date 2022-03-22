import React, { useState } from 'react'
import moment from 'moment'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import { outcomeWidth } from '../../drawing/dimensions'
import Icon from '../Icon/Icon'
import StatusPicker from '../StatusPicker'
import PeoplePicker from '../PeoplePicker/PeoplePicker.connector'
import DatePicker from '../DatePicker/DatePicker'
import HierarchyPicker from '../HierarchyPicker/HierarchyPicker'
import PriorityPicker from '../PriorityPicker/PriorityPicker.connector'
import StatusIcon from '../StatusIcon/StatusIcon'
import Modal, { ModalContent } from '../Modal/Modal'
import './VerticalActionsList.scss'

function VerticalActionListItem({ onClick, label, icon }) {
  return (
    <div className="actions-list-item" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </div>
  )
}

export default function VerticalActionsList({
  agentAddress,
  projectId,
  outcomeAddress,
  outcome,
  onDeleteClick,
  updateOutcome,
  leftConnectionXPosition,
  topConnectionYPosition,
}) {
  const defaultViews = {
    status: false,
    squirrels: false,
    timeframe: false,
    priority: false,
    hierarchy: false,
  }
  const [viewsOpen, setViews] = useState(defaultViews)

  const innerUpdateOutcome = (key) => (val) => {
    updateOutcome(
      {
        ...outcome,
        userEditHash: agentAddress,
        timestampUpdated: moment().unix(),
        [key]: val,
      },
      outcomeAddress
    )
  }

  const toggleView = (key) => {
    setViews({ ...defaultViews, [key]: !viewsOpen[key] })
  }

  const deleteContent = (
    <div>
      You're about to delete the card "<b>{outcome.content}</b>
      ". You will be able to see this card in the delete view mode in the
      future. Proceed?
    </div>
  )

  // timeframe consts

  const updateTimeframe = (start, end) => {
    let timeframe = null

    if (start && end) {
      timeframe = {
        fromDate: start,
        toDate: end,
      }
    }

    updateOutcome(
      {
        ...outcome,
        userEditHash: agentAddress,
        timestampUpdated: moment().unix(),
        timeFrame: timeframe,
      },
      outcomeAddress
    )
  }

  const fromDate = outcome.timeFrame
    ? moment.unix(outcome.timeFrame.fromDate)
    : null
  const toDate = outcome.timeFrame ? moment.unix(outcome.timeFrame.toDate) : null

  return (
    <>
      <div
        className="vertical-actions-list"
        style={{
          left: `${leftConnectionXPosition}px`,
          top: `${topConnectionYPosition}px`,
        }}
      >
        <VerticalActionListItem
          label="Status"
          icon={
            <StatusIcon size="very-small" status={outcome.status} hideTooltip />
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
              name="hierarchy-leaf.svg"
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
              name="sort-asc.svg"
              className="black not-hoverable"
            />
          }
          onClick={() => toggleView('priority')}
        />
        {/* TODO : make the Alert Popup screen and certain elements */}
        {/* like Quick Edit Icon and Expand Icon not shrink after zooming out on canvas */}
        {/* fix the delete based popup, by moving it UP the render tree OUTSIDE the MapView, which
             gets zoomed in out as the map does */}
        {/* <VerticalActionListItem
          label='delete'
          icon={<Icon name='delete.svg' className='white not-hoverable' />}
          onClick={() => toggleView('delete')}
        /> */}
        {viewsOpen.status && (
          <StatusPicker
            projectId={projectId}
            selectedStatus={outcome.status}
            statusClicked={innerUpdateOutcome('status')}
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
            selectedHierarchy={outcome.hierarchy}
            hierarchyClicked={innerUpdateOutcome('hierarchy')}
          />
        )}
        {viewsOpen.priority && (
          <PriorityPicker
            projectId={projectId}
            outcomeAddress={outcomeAddress}
            onClose={() => setViews({ ...defaultViews })}
          />
        )}
      </div>
      <Modal
        active={viewsOpen.delete}
        onClose={() => setViews({ ...defaultViews })}
        className="delete-popup"
      >
        <ModalContent
          heading="Archiving"
          content={deleteContent}
          icon="delete.svg"
          primaryButton="Yes, Delete"
          altButton="Nevermind"
          primaryButtonAction={() => onDeleteClick(outcomeAddress)}
          altButtonAction={() => setViews({ ...defaultViews })}
        />
      </Modal>
    </>
  )
}

function mapStateToProps(state, ownProps) {
  // outcome headerHash
  const outcomeAddress = state.ui.outcomeForm.editAddress
  // project ID
  const { projectId } = ownProps
  const outcomes = state.projects.outcomes[projectId] || {}

  // Figure out where is that outcome on the canvas:
  // figure out where on the canvas the outcome being edited is
  // located, according to the canvas coordinate system
  // x, y
  const width = state.ui.screensize.width
  const outcomeCoordinate = state.ui.layout[outcomeAddress]

  // Figure out where is that outcome is relation to the window:
  // coordinates translation to css from canvas
  const translate = state.ui.viewport.translate
  const scale = state.ui.viewport.scale
  // position it at the right of the outcome, by moving to the right
  // by the width of a Outcome
  const cssCoordinates = coordsCanvasToPage(
    { x: (outcomeCoordinate.x + outcomeWidth), y: outcomeCoordinate.y },
    translate,
    scale
  )

  return {
    agentAddress: state.agentAddress,
    outcomeAddress,
    outcome: outcomes[outcomeAddress],
    leftConnectionXPosition: cssCoordinates.x,
    topConnectionYPosition: cssCoordinates.y,
  }
}
