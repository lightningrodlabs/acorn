import React, { useState, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import Icon from '../Icon/Icon'
import EVMiddleColumn from './EVMiddleColumn/EVMiddleColumn'
import EVLeftColumn from './EVLeftColumn/EVLeftColumn'
import { ExpandedViewTab } from './NavEnum'
import { CellIdString, HeaderHashB64 } from '../../types/shared'
import { ComputedOutcome, ComputedScope } from '../../types'
import './ExpandedViewMode.scss'
import ButtonClose from '../ButtonClose/ButtonClose'
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs'
import hashCodeId from '../../api/clientSideIdHash'
import OnClickOutside from '../OnClickOutside/OnClickOutside'

// props passed to the component by the parent
export type ExpandedViewModeOwnProps = {
  projectId: CellIdString
  onClose: () => void
  openExpandedView: (headerHash: HeaderHashB64) => void
  outcome: ComputedOutcome
  outcomeAndAncestors: ComputedOutcome[]
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
  outcomeAndAncestors,
  outcomeHeaderHash,
  openExpandedView,
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

  useEffect(() => {
    // don't do anything if we're dealing with the ExpandedViewMode
    // closing itself
    if (outcomeHeaderHash) {
      setActiveTab(ExpandedViewTab.Details)
    }
  }, [outcomeHeaderHash])

  const outcomeId = hashCodeId(outcomeHeaderHash)

  const childrenCount =
    outcome && outcome.children ? outcome.children.length : 0

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
        <div className="expanded-view-overlay">
          <div className="expanded-view-breadcrumbs-wrapper">
            <Breadcrumbs
              outcomeAndAncestors={outcomeAndAncestors}
              onClickItem={(headerHash) => {
                openExpandedView(headerHash)
              }}
            />
          </div>
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
            childrenCount={childrenCount}
            showTaskList={showTaskListMenuItem}
            taskListCount={taskListCount}
            outcomeId={outcomeId}
          />
          <div className="expanded-view-tab-view-wrapper">
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
        </div>

      </CSSTransition>
    </>
  )
}

export default ExpandedViewMode
