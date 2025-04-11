import React, { useState, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import EVMiddleColumn from './EVMiddleColumn/EVMiddleColumn'
import EVLeftColumn from './EVLeftColumn/EVLeftColumn'
import { ExpandedViewTab } from './NavEnum'
import { CellIdString, ActionHashB64, AgentPubKeyB64 } from '../../types/shared'
import { ComputedOutcome, Outcome } from '../../types'
import './ExpandedViewMode.scss'
import ButtonClose from '../ButtonClose/ButtonClose'
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs'
import hashCodeId from '../../api/clientSideIdHash'

// props passed to the component by the parent
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
}

// redux props
export type ExpandedViewModeConnectorProps = {
  outcomeActionHash: ActionHashB64
  commentCount: number
  activeAgentPubKey: AgentPubKeyB64
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
}) => {
  // Details is default tab
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

  const outcomeId = hashCodeId(outcomeActionHash)

  // if not small, then show children list icon on left menu
  const showChildrenListMenuItem = outcome && !('Small' in outcome.scope)
  const childrenCount =
    outcome && outcome.children ? outcome.children.length : 0

  // if  small, then show task list icon on left menu
  const showTaskListMenuItem =
    childrenCount === 0 && outcome && 'Small' in outcome.scope
  const taskListCount =
    childrenCount === 0 && outcome && 'Small' in outcome.scope
      ? outcome.scope.Small.taskList.length
      : 0

  return (
    <>
      <CSSTransition
        in={showing}
        timeout={100}
        unmountOnExit
        classNames="expanded-view-overlay"
      >
        <div className="expanded-view-overlay" onClick={onClose}></div>
      </CSSTransition>
      <CSSTransition
        in={showing}
        timeout={100}
        unmountOnExit
        classNames="breadcrumbs-overlay"
      >
        <div className="breadcrumbs-overlay">
          <Breadcrumbs
            outcomeAndAncestors={outcomeAndAncestors}
            onClickItem={(actionHash) => {
              openExpandedView(actionHash)
            }}
          />
        </div>
      </CSSTransition>
      <CSSTransition
        in={showing}
        timeout={100}
        unmountOnExit
        classNames="expanded-view-wrapper"
      >
        <div className="expanded-view-wrapper">
          <ButtonClose onClick={onClose} size="medium" />
          <EVLeftColumn
            activeTab={activeTab}
            onChange={setActiveTab}
            commentCount={commentCount}
            showChildrenList={showChildrenListMenuItem}
            childrenCount={childrenCount}
            showTaskList={showTaskListMenuItem}
            taskListCount={taskListCount}
            outcomeId={outcomeId}
            attachmentsNumber={attachments?.props.attachmentsInfo.length}
          />
          <div className="expanded-view-tab-view-wrapper">
            <EVMiddleColumn
              activeTab={activeTab}
              outcome={outcome}
              projectId={projectId}
              details={details}
              comments={comments}
              childrenList={childrenList}
              taskList={taskList}
              attachments={attachments}
            />
            {/* Only show the rightColumn while */}
            {/* viewing Details */}
            {activeTab === ExpandedViewTab.Details && rightColumn}
          </div>
        </div>
      </CSSTransition>
    </>
  )
}

export default ExpandedViewMode
