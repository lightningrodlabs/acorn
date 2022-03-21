import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { deleteOutcomeFully, updateOutcome } from '../../redux/persistent/projects/outcomes/actions'
import moment from 'moment'

import './MultiEditBar.scss'

import Icon from '../Icon/Icon'
import Avatar from '../Avatar/Avatar'
import StatusIcon from '../StatusIcon/StatusIcon'

import StatusPicker from '../StatusPicker'
import PeoplePicker from '../PeoplePicker/PeoplePicker.connector'
import DatePicker from '../DatePicker/DatePicker'
import HierarchyPicker from '../HierarchyPicker/HierarchyPicker'
import ConnectionConnectorPicker from '../ConnectionConnectorPicker/ConnectionConnectorPicker.connector'
import Modal, { ModalContent } from '../Modal/Modal'

export default function MultiEditBar({
  agentAddress,
  selectedOutcomes = [],
  updateOutcome,
  hasSelection,
  deleteOutcomeFully,
}) {
  const defaultViews = {
    status: false,
    squirrels: false,
    timeframe: false,
    hierarchy: false,
    connectionConnector: false,
    delete: false,
  }
  const [popup, setPopup] = useState(false)
  const [viewsOpen, setViews] = useState(defaultViews)

  const [statusColor, setStatusColor] = useState(
    selectedOutcomes.length ? selectedOutcomes[0].status : 'Uncertain'
  )

  useEffect(() => {
    if (selectedOutcomes.length) {
      setStatusColor(selectedOutcomes[0].status)
    }
  }, [selectedOutcomes])

  // close any popups if you deselect
  useEffect(() => {
    if (!hasSelection) {
      setViews({ ...defaultViews })
    }
  }, [hasSelection])

  const updateOutcomes = key => val => {
    selectedOutcomes.forEach(outcome => {
      updateOutcome(
        {
          ...outcome,
          userEditHash: agentAddress,
          timestampUpdated: moment().unix(),
          [key]: val,
        },
        outcome.headerHash
      )
    })
  }

  const deleteOutcomes = async () => {
    // has to be in async series
    // because Holochain doesn't accept ChainTopOrdering::Relaxed
    // for `delete` calls yet. TODO update this
    // when we can, to occur in parallel, like `updateOutcomes` above
    for (let outcome of selectedOutcomes) {
      await deleteOutcomeFully(outcome.headerHash)
    }
  }

  const multiEditBarSquirrelsClass = viewsOpen.squirrels ? 'active' : ''
  const multiEditBarHierarchyClass = viewsOpen.hierarchy ? 'active' : ''
  const multiEditBarTimeframeClass = viewsOpen.timeframe ? 'active' : ''
  const multiEditBarConnectionConnectorClass = viewsOpen.connectionConnector ? 'active' : ''
  const multiEditBarDeleteClass = viewsOpen.delete ? 'active' : ''

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

  const deleteContent = (
    <div>
      You're about to delete the following {selectedOutcomes.length} card(s):
      <div className='modal-outcomes-list'>
        {selectedOutcomes.map(outcome => (
          <div key={outcome.headerHash}>- {outcome.content}</div>
        ))}
      </div>
      You will be able to see these cards in the delete view mode in the
      future. Proceed?
    </div>
  )

  /* timeframe consts */

  const updateTimeframe = (start, end) => {
    let timeframe = null

    if (start && end) {
      timeframe = {
        fromDate: start,
        toDate: end,
      }
    }

    updateOutcomes('timeFrame')(timeframe)
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
            statusClicked={updateOutcomes('status')}
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
        {viewsOpen.hierarchy && selectedOutcomes.length > 0 && (
          <HierarchyPicker
            selectedHierarchy={selectedOutcomes[0].hierarchy}
            hierarchyClicked={updateOutcomes('hierarchy')}
            onClose={() => setViews({ ...defaultViews })}
          />
        )}
        {/* connection connector */}
        <Icon
          name='connection-connector.svg'
          size='medium-MultiEditBar'
          className={multiEditBarConnectionConnectorClass}
          key='connectionConnector'
          onClick={() => toggleView('connectionConnector')}
        />
        {viewsOpen.connectionConnector && (
          <ConnectionConnectorPicker onClose={() => setViews({ ...defaultViews })} />
        )}
        {/* delete */}
        <Icon
          name='delete.svg'
          key='delete'
          className={multiEditBarDeleteClass}
          onClick={() => toggleView('delete')}
        />
      </div>
      {selectedOutcomes.length > 1 && (
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
        className='delete-popup'
        active={viewsOpen.delete}>
        <ModalContent
          heading='Archiving'
          content={deleteContent}
          icon='delete.svg'
          primaryButton='Yes, Delete'
          altButton='Nevermind'
          primaryButtonAction={deleteOutcomes}
          altButtonAction={reset}
        />
      </Modal>
    </>
  )
}

