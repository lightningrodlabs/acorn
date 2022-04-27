import React, { useState, useEffect } from 'react'
import moment from 'moment'
import Icon from '../Icon/Icon'
import DatePicker from '../DatePicker/DatePicker'
import ConnectionConnectorPicker from '../ConnectionConnectorPicker/ConnectionConnectorPicker.connector'
import Modal, { ModalContent } from '../Modal/Modal'

import './MultiEditBar.scss'

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
          editorAgentPubKey: agentAddress,
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
    modalIcon = 'leaf.svg'
  }

  return (
    <>
      <div className={`multi-edit-bar ${hasSelection ? 'has-selection' : ''}`}>
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

