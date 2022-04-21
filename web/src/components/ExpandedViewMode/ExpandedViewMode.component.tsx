import React, { useState, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import Icon from '../Icon/Icon'
import EVMiddleColumn from './EVMiddleColumn/EVMiddleColumn'
import EVLeftColumn from './EVLeftColumn/EVLeftColumn'
import { ExpandedViewTab } from './NavEnum'
import { CellIdString, HeaderHashB64 } from '../../types/shared'
import { ComputedOutcome } from '../../types'
import './ExpandedViewMode.scss'

// props passed to the component by the parent
export type ExpandedViewModeOwnProps = {
  projectId: CellIdString
  onClose: () => void
  outcome: ComputedOutcome
  details: React.ReactElement
  comments: React.ReactElement
  childrenList: React.ReactElement
  taskList: React.ReactElement
  rightColumn: React.ReactElement
}

// redux props
export type ExpandedViewModeConnectorProps = {
  outcomeHeaderHash: HeaderHashB64
  commentCount: number
}

export type ExpandedViewModeProps = ExpandedViewModeOwnProps &
  ExpandedViewModeConnectorProps

const ExpandedViewMode: React.FC<ExpandedViewModeProps> = ({
  outcome,
  outcomeHeaderHash,
  commentCount,
  details,
  comments,
  childrenList,
  taskList,
  rightColumn,
  onClose,
}) => {
  // Details is default tab
  const [activeTab, setActiveTab] = useState(ExpandedViewTab.Details)
  const [showing, setShowing] = useState(false)

  useEffect(() => {
    // reset
    if (!outcomeHeaderHash) {
      setActiveTab(ExpandedViewTab.Details)
    }

    if (showing && !outcomeHeaderHash) {
      setShowing(false)
    } else if (!showing && outcomeHeaderHash) {
      setShowing(true)
    }
  }, [outcomeHeaderHash])

  // TODO: set up the notion of an Outcome Id
  const outcomeId = 124543

  const childrenCount =
    outcome && outcome.children ? outcome.children.length : 0
  // TODO: tasklist
  const taskListCount = 0

  return (
    <>
      <CSSTransition
        in={showing}
        timeout={100}
        unmountOnExit
        classNames="expanded-view-overlay"
      >
        <div className="expanded-view-overlay" />
      </CSSTransition>
      <CSSTransition
        in={showing}
        timeout={100}
        unmountOnExit
        classNames="expanded-view-wrapper"
      >
        <div className="expanded-view-wrapper">
          {/* @ts-ignore */}
          <Icon
            onClick={onClose}
            name="x.svg"
            size="small-close"
            className="light-grey"
          />
          <EVLeftColumn
            activeTab={activeTab}
            onChange={setActiveTab}
            commentCount={commentCount}
            childrenCount={childrenCount}
            taskListCount={taskListCount}
            outcomeId={outcomeId}
          />
          <EVMiddleColumn
            activeTab={activeTab}
            outcome={outcome}
            details={details}
            comments={comments}
            childrenList={childrenList}
            taskList={taskList}
          />
          {/* Only show the rightColumn while */}
          {/* viewing Details */}
          {activeTab === ExpandedViewTab.Details && rightColumn}
        </div>
      </CSSTransition>
    </>
  )
}

export default ExpandedViewMode
