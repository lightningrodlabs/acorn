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
            onChange={(newTab) => setActiveTab(newTab)}
            commentCount={commentCount}
          />
          <EVMiddleColumn
            activeTab={activeTab}
            outcome={outcome}
            details={details}
            comments={comments}
          />
          {rightColumn}
        </div>
      </CSSTransition>
    </>
  )
}

export default ExpandedViewMode
