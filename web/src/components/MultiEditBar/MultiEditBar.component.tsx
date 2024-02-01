import React, { useState, useEffect } from 'react'
import { AppAgentClient } from '@holochain/client'
import moment from 'moment'
import { AgentPubKeyB64, CellIdString } from '../../types/shared'
import { ComputedOutcome } from '../../types'
import Icon from '../Icon/Icon'
import OutcomeConnectorPicker from '../OutcomeConnectorPicker/OutcomeConnectorPicker.connector'
import Modal, { ModalContent } from '../Modal/Modal'

import './MultiEditBar.scss'

export type MultiEditBarStateProps = {
  agentAddress: AgentPubKeyB64
  selectedOutcomes?: ComputedOutcome[]
}

export type MultiEditBarDispatchProps = {
  updateOutcome: (outcome: any, actionHash: string) => void
  deleteOutcomeFully: (actionHash: string) => Promise<void>
}

export type MultiEditBarOwnProps = {
  projectId: CellIdString
  hasMultiSelection: boolean
  appWebsocket: AppAgentClient
}

export type MultiEditBarProps = MultiEditBarStateProps & MultiEditBarDispatchProps & MultiEditBarOwnProps

export default function MultiEditBar({
  agentAddress,
  selectedOutcomes = [],
  updateOutcome,
  hasMultiSelection,
  deleteOutcomeFully,
}) {
  const defaultViews = {
    status: false,
    squirrels: false,
    timeframe: false,
    hierarchy: false,
    outcomeConnector: false,
    delete: false,
  }
  const [popup, setPopup] = useState(false)
  const [viewsOpen, setViews] = useState(defaultViews)

  // close any popups if you deselect
  useEffect(() => {
    if (!hasMultiSelection) {
      setViews({ ...defaultViews })
    }
  }, [hasMultiSelection])

  const updateOutcomes = (key) => (val) => {
    selectedOutcomes.forEach((outcome) => {
      updateOutcome(
        {
          ...outcome,
          editorAgentPubKey: agentAddress,
          timestampUpdated: moment().unix(),
          [key]: val,
        },
        outcome.actionHash
      )
    })
  }

  const deleteOutcomes = async () => {
    // has to be in async series
    // because Holochain doesn't accept ChainTopOrdering::Relaxed
    // for `delete` calls yet. TODO update this
    // when we can, to occur in parallel, like `updateOutcomes` above
    for (let outcome of selectedOutcomes) {
      await deleteOutcomeFully(outcome.actionHash)
    }
  }

  const multiEditBarSquirrelsClass = viewsOpen.squirrels ? 'active' : ''
  const multiEditBarHierarchyClass = viewsOpen.hierarchy ? 'active' : ''
  const multiEditBarTimeframeClass = viewsOpen.timeframe ? 'active' : ''
  const multiEditBarOutcomeConnectorClass = viewsOpen.outcomeConnector
    ? 'active'
    : ''
  const multiEditBarDeleteClass = viewsOpen.delete ? 'active' : ''

  const toggleView = (key) => {
    if (!viewsOpen[key]) {
      setPopup(true)
    }
    setViews({ ...defaultViews, [key]: !viewsOpen[key] })
  }

  const reset = () => {
    setPopup(false)
    setViews({ ...defaultViews })
  }

  // currently not functional / needing updaing
  const statusAlertContent = (
    <div>
      This function will override the statuses on all selected cards. Proceed?
    </div>
  )

  // currently not functional / needing updaing
  const squirrelsAlertContent = (
    <div>
      This function will override the existing associated members on all
      selected cards. Proceed?
    </div>
  )

  // currently not functional / needing updaing
  const timeframeAlertContent = (
    <div>
      This function will override the existing timeframes set on all selected
      cards. Proceed?
    </div>
  )

  // Content for multi edit archive modal
  const archiveContent = (
    <div>
      You're about to archive the following{' '}
      {selectedOutcomes.length > 1 && <b>{selectedOutcomes.length}</b>} Outcome
      {selectedOutcomes.length > 1 ? 's' : ''}:
      <div className="modal-outcomes-list">
        <ul>
          {selectedOutcomes.map((outcome) => (
            <li key={outcome.actionHash}>{outcome.content}</li>
          ))}
        </ul>
      </div>
      You will no longer have access to archived Outcomes. Proceed?
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
  }

  return (
    <>
      <div
        className={`multi-edit-bar ${hasMultiSelection ? 'has-selection' : ''}`}
      >
        {/* outcome connector button */}
        <Icon
          name="hierarchy.svg"
          size="medium-MultiEditBar"
          className={multiEditBarOutcomeConnectorClass}
          key="outcomeConnector"
          onClick={() => toggleView('outcomeConnector')}
          withTooltipTop
          tooltipText="Outcome Connector"
        />

        {/* archive selected outcomes */}
        <Icon
          name="archive.svg"
          key="delete"
          className={multiEditBarDeleteClass}
          onClick={() => toggleView('delete')}
          withTooltipTop
          tooltipText="Archive"
        />
      </div>

      {/* open modal for outcome connector */}
      <OutcomeConnectorPicker
        active={viewsOpen.outcomeConnector}
        onClose={() => setViews({ ...defaultViews })}
      />

      {/* open modal for archiving selected outcomes */}
      <Modal
        onClose={reset}
        className="multi-edit-modal"
        active={viewsOpen.delete}
      >
        <ModalContent
          heading="Archiving"
          content={archiveContent}
          icon="archive.svg"
          primaryButton="Yes, Archive"
          altButton="Nevermind"
          primaryButtonAction={deleteOutcomes}
          altButtonAction={reset}
        />
      </Modal>

      {/* Currently not functional, needs updating */}
      {selectedOutcomes.length > 1 && (
        <Modal onClose={reset} className={modalClassname} active={showModal}>
          <ModalContent
            heading={modalHeading}
            content={modalContent}
            icon={modalIcon}
            primaryButton="Yes, Proceed"
            altButton="Nevermind"
            primaryButtonAction={() => setPopup(false)}
            altButtonAction={reset}
          />
        </Modal>
      )}
    </>
  )
}
