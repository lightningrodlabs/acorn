import React, { useState, useEffect } from 'react'
// CSSTransition, ButtonClose, Breadcrumbs are now in the ModalWrapper
// import { CSSTransition } from 'react-transition-group'
// import ButtonClose from '../ButtonClose/ButtonClose'
// import Breadcrumbs from '../Breadcrumbs/Breadcrumbs'
import ExpandedViewModeInner from './ExpandedViewModeInner' // Import the new inner component
import ExpandedViewModeModalWrapper from './ExpandedViewModeModalWrapper' // Import the new wrapper component
import { ExpandedViewTab } from './NavEnum'
import { CellIdString, ActionHashB64, AgentPubKeyB64 } from '../../types/shared'
import { ComputedOutcome, Outcome } from '../../types'
import './ExpandedViewMode.scss' // Styles for inner layout + non-modal container

// Props passed to the component by the parent/connector
export type ExpandedViewModeOwnProps = {
  projectId: CellIdString
  onClose: () => void
  openExpandedView: (actionHash: ActionHashB64) => void
  outcome: ComputedOutcome
  outcomeAndAncestors: ComputedOutcome[]
  details: React.ReactElement
  comments: React.ReactElement
  childrenList: React.ReactElement
  taskList: React.ReactElement
  rightColumn: React.ReactElement
  updateOutcome: (outcome: Outcome, actionHash: ActionHashB64) => Promise<void>
  attachments?: React.ReactElement
  renderAsModal?: boolean // This prop now controls which wrapper is used
}

// Redux props (remain the same)
export type ExpandedViewModeConnectorProps = {
  outcomeActionHash: ActionHashB64
  commentCount: number
  activeAgentPubKey: AgentPubKeyB64 // Although not directly used here, passed down
}

export type ExpandedViewModeProps = ExpandedViewModeOwnProps &
  ExpandedViewModeConnectorProps

const ExpandedViewMode: React.FC<ExpandedViewModeProps> = ({
  projectId,
  outcome,
  outcomeAndAncestors,
  outcomeActionHash,
  openExpandedView,
  commentCount,
  details,
  comments,
  childrenList,
  taskList,
  rightColumn,
  onClose,
  attachments,
  renderAsModal = true, // Default to true
}) => {
  // State remains here as it controls the inner component's tab
  // and the modal wrapper's transitions
  const [activeTab, setActiveTab] = useState(ExpandedViewTab.Details)
  const [showing, setShowing] = useState(false)

  useEffect(() => {
    // reset
    if (!outcomeActionHash) {
      setActiveTab(ExpandedViewTab.Details)
    }

    if (showing && !outcomeActionHash) {
      setShowing(false)
    } else if (!showing && outcomeActionHash) {
      setShowing(true)
    }
  }, [outcomeActionHash])

  useEffect(() => {
    // don't do anything if we're dealing with the ExpandedViewMode
    // closing itself
    if (outcomeActionHash) {
      setActiveTab(ExpandedViewTab.Details)
    }
  }, [outcomeActionHash])

  useEffect(() => {
    if (outcome) {
      // make sure that a section that isn't available, based on changes
      // to the Outcome, isn't shown
      if (
        'Small' in outcome.scope &&
        activeTab === ExpandedViewTab.ChildrenList
      ) {
        setActiveTab(ExpandedViewTab.TaskList)
      } else if (
        'Uncertain' in outcome.scope &&
        activeTab === ExpandedViewTab.TaskList
      ) {
        setActiveTab(ExpandedViewTab.ChildrenList)
      }
    }
  }, [outcome, activeTab, setActiveTab])

  // Prepare props for the inner component
  const innerProps = {
    projectId,
    outcome,
    outcomeActionHash,
    activeTab,
    setActiveTab,
    commentCount,
    details,
    comments,
    childrenList,
    taskList,
    rightColumn,
    attachments,
  }

  // Conditionally render based on renderAsModal
  if (renderAsModal) {
    return (
      <ExpandedViewModeModalWrapper
        showing={showing}
        onClose={onClose}
        outcomeAndAncestors={outcomeAndAncestors}
        openExpandedView={openExpandedView}
      >
        {/* Render the inner component inside the modal wrapper */}
        <ExpandedViewModeInner {...innerProps} />
      </ExpandedViewModeModalWrapper>
    )
  } else {
    // Render the inner component directly within a simple container
    // This container uses styles previously in ExpandedViewMode.scss
    return (
      <div className="expanded-view-interior-only">
        <ExpandedViewModeInner {...innerProps} />
      </div>
    )
  }
}

export default ExpandedViewMode
