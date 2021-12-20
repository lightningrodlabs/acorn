import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { archiveGoalFully, updateGoal } from '../../projects/goals/actions'
import moment from 'moment'

import './MultiEditBar.css'

import Icon from '../Icon/Icon'
import Avatar from '../Avatar/Avatar'
import StatusIcon from '../StatusIcon/StatusIcon'

import StatusPicker from '../StatusPicker'
import PeoplePicker from '../PeoplePicker/PeoplePicker'
import DatePicker from '../DatePicker/DatePicker'
import HierarchyPicker from '../HierarchyPicker/HierarchyPicker'
import EdgeConnectorPicker from '../EdgeConnectorPicker/EdgeConnectorPicker'
import Modal, { ModalContent } from '../Modal/Modal'

function MultiEditBar({
  agentAddress,
  selectedGoals = [],
  updateGoal,
  hasSelection,
  archiveGoalFully,
}) {
  const defaultViews = {
    status: false,
    squirrels: false,
    timeframe: false,
    hierarchy: false,
    edgeConnector: false,
    archive: false,
  }
  const [popup, setPopup] = useState(false)
  const [viewsOpen, setViews] = useState(defaultViews)

  const [statusColor, setStatusColor] = useState(
    selectedGoals.length ? selectedGoals[0].status : 'Uncertain'
  )

  useEffect(() => {
    if (selectedGoals.length) {
      setStatusColor(selectedGoals[0].status)
    }
  }, [selectedGoals])

  // close any popups if you deselect
  useEffect(() => {
    if (!hasSelection) {
      setViews({ ...defaultViews })
    }
  }, [hasSelection])

  const updateGoals = key => val => {
    selectedGoals.forEach(goal => {
      updateGoal(
        {
          ...goal,
          user_edit_hash: agentAddress,
          timestamp_updated: moment().unix(),
          [key]: val,
        },
        goal.headerHash
      )
    })
  }

  const archiveGoals = async () => {
    // has to be in async series
    // because Holochain doesn't accept ChainTopOrdering::Relaxed
    // for `delete` calls yet. TODO update this
    // when we can, to occur in parallel, like `updateGoals` above
    for (let goal of selectedGoals) {
      await archiveGoalFully(goal.headerHash)
    }
  }

  const multiEditBarSquirrelsClass = viewsOpen.squirrels ? 'active' : ''
  const multiEditBarHierarchyClass = viewsOpen.hierarchy ? 'active' : ''
  const multiEditBarTimeframeClass = viewsOpen.timeframe ? 'active' : ''
  const multiEditBarEdgeConnectorClass = viewsOpen.edgeConnector ? 'active' : ''
  const multiEditBarArchiveClass = viewsOpen.archive ? 'active' : ''

  const toggleView = key => {
    if (!viewsOpen[key]) {
      setPopup(true)
    }
    setViews({ ...defaultViews, [key]: !viewsOpen[key] })
  }

  const reset = () => {
    setPopup(false)
    setViews({ ...defaultViews })
  }

  const statusAlertContent = (
    <div>
      This function will override the statuses on all selected cards. Proceed?
    </div>
  )

  const squirrelsAlertContent = (
    <div>
      This function will override the existing associated members on all
      selected cards. Proceed?
    </div>
  )

  const timeframeAlertContent = (
    <div>
      This function will override the existing timeframes set on all selected
      cards. Proceed?
    </div>
  )

  const hierarchyAlertContent = (
    <div>
      This function will override the existing hierarchy levels on all selected
      cards. Proceed?
    </div>
  )

  const archiveContent = (
    <div>
      You're about to archive the following {selectedGoals.length} card(s):
      <div className='modal-goals-list'>
        {selectedGoals.map(goal => (
          <div key={goal.headerHash}>- {goal.content}</div>
        ))}
      </div>
      You will be able to see these cards in the archive view mode in the
      future. Proceed?
    </div>
  )

  /* timeframe consts */

  const updateTimeframe = (start, end) => {
    let timeframe = null

    if (start && end) {
      timeframe = {
        from_date: start,
        to_date: end,
      }
    }

    updateGoals('time_frame')(timeframe)
  }

  let showModal = false,
    modalClassname,
    modalHeading,
    modalContent,
    modalIcon
  if (popup && viewsOpen.status) {
    showModal = true
    modalClassname = 'status-popup'
    modalHeading = 'Setting Status for Multiple Cards'
    modalContent = statusAlertContent
    modalIcon = 'status-unknown.svg'
  } else if (popup && viewsOpen.squirrels) {
    showModal = true
    modalClassname = 'squirrel-popup'
    modalHeading = 'Associating Members for Multiple Cards'
    modalContent = squirrelsAlertContent
    modalIcon = 'squirrel.svg'
  } else if (popup && viewsOpen.timeframe) {
    showModal = true
    modalClassname = 'timeframe-popup'
    modalHeading = 'Setting Timeframe for Multiple Cards'
    modalContent = timeframeAlertContent
    modalIcon = 'calendar.svg'
  } else if (popup && viewsOpen.hierarchy) {
    showModal = true
    modalClassname = 'hierarchy-popup'
    modalHeading = 'Setting Hierarchy for Multiple Cards'
    modalContent = hierarchyAlertContent
    modalIcon = 'hierarchy-leaf.svg'
  }

  return (
    <>
      <div className={`multi-edit-bar ${hasSelection ? 'has-selection' : ''}`}>
        {/* status */}
        <StatusIcon
          size='small-MultiEditBar'
          key='status'
          notHoverable
          hideTooltip
          status={statusColor}
          onClick={() => toggleView('status')}
        />
        {viewsOpen.status && (
          <StatusPicker
            statusClicked={updateGoals('status')}
            onClose={() => setViews({ ...defaultViews })}
          />
        )}
        {/* squirrels */}
        {/* TODO: connect multi edit squirrels */}
        {/* <Icon
          name='squirrel.svg'
          size='medium-MultiEditBar'
          className={multiEditBarSquirrelsClass}
          key='squirrels'
          onClick={() => toggleView('squirrels')}
        />
        {viewsOpen.squirrels && (
          <PeoplePicker projectId={projectId} onClose={() => setViews({ ...defaultViews })} />
        )} */}
        {/* timeframe */}
        <Icon
          name='calendar.svg'
          size='medium-MultiEditBar'
          className={multiEditBarTimeframeClass}
          key='timeframe'
          onClick={() => toggleView('timeframe')}
        />
        {viewsOpen.timeframe && (
          <DatePicker
            onClose={() => setViews({ ...defaultViews })}
            onSet={updateTimeframe}
          />
        )}
        {/* hierarchy */}
        <Icon
          name='hierarchy-leaf.svg'
          size='medium-MultiEditBar'
          className={multiEditBarHierarchyClass}
          key='hierarchy'
          onClick={() => toggleView('hierarchy')}
        />
        {viewsOpen.hierarchy && selectedGoals.length > 0 && (
          <HierarchyPicker
            selectedHierarchy={selectedGoals[0].hierarchy}
            hierarchyClicked={updateGoals('hierarchy')}
            onClose={() => setViews({ ...defaultViews })}
          />
        )}
        {/* edge connector */}
        <Icon
          name='edge-connector.svg'
          size='medium-MultiEditBar'
          className={multiEditBarEdgeConnectorClass}
          key='edgeConnector'
          onClick={() => toggleView('edgeConnector')}
        />
        {viewsOpen.edgeConnector && (
          <EdgeConnectorPicker onClose={() => setViews({ ...defaultViews })} />
        )}
        {/* archive */}
        <Icon
          name='archive.svg'
          key='archive'
          className={multiEditBarArchiveClass}
          onClick={() => toggleView('archive')}
        />
      </div>
      {selectedGoals.length > 1 && (
        <Modal onClose={reset} className={modalClassname} active={showModal}>
          <ModalContent
            heading={modalHeading}
            content={modalContent}
            icon={modalIcon}
            primaryButton='Yes, Proceed'
            altButton='Nevermind'
            primaryButtonAction={() => setPopup(false)}
            altButtonAction={reset}
          />
        </Modal>
      )}
      <Modal
        onClose={reset}
        className='archive-popup'
        active={viewsOpen.archive}>
        <ModalContent
          heading='Archiving'
          content={archiveContent}
          icon='archive.svg'
          primaryButton='Yes, Archive'
          altButton='Nevermind'
          primaryButtonAction={archiveGoals}
          altButtonAction={reset}
        />
      </Modal>
    </>
  )
}

MultiEditBar.propTypes = {
  selectedGoals: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.string.isRequired,
      user_hash: PropTypes.string.isRequired,
      timestamp_created: PropTypes.number.isRequired,
      timestamp_updated: PropTypes.number,
      hierarchy: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      address: PropTypes.string,
    })
  ).isRequired,
  updateGoal: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  const {
    ui: { activeProject },
  } = state
  const goals = state.projects.goals[activeProject] || {}
  return {
    agentAddress: state.agentAddress,
    selectedGoals: state.ui.selection.selectedGoals.map(
      headerHash => goals[headerHash]
    ),
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    updateGoal: (entry, headerHash) => {
      return dispatch(
        updateGoal.create({ cellIdString, payload: { headerHash, entry } })
      )
    },
    archiveGoalFully: payload => {
      return dispatch(archiveGoalFully.create({ cellIdString, payload }))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MultiEditBar)
