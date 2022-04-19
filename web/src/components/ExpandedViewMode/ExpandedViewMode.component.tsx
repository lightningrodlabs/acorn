import React, { useState, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import Icon from '../Icon/Icon'
import EVMiddleColumn from './EVMiddleColumn/EVMiddleColumn.component'
import EVLeftColumn from './EVLeftColumn/EVLeftColumn'
import EVRightColumn from './EVRightColumn/EVRightColumn.connector'
import { ExpandedViewTab } from './NavEnum'
import { CellIdString, HeaderHashB64 } from '../../types/shared'
import './ExpandedViewMode.scss'
import { ComputedOutcome } from '../../types'

// props passed to the component by the parent
export type ExpandedViewModeOwnProps = {
  onClose: () => void
  projectId: CellIdString
  outcome: ComputedOutcome
}

// redux props
export type ExpandedViewModeConnectorProps = {
  outcomeHeaderHash: HeaderHashB64
  commentCount: number
}

export type ExpandedViewModeProps = ExpandedViewModeOwnProps &
  ExpandedViewModeConnectorProps

const ExpandedViewMode: React.FC<ExpandedViewModeProps> = ({
  projectId,
  outcome,
  outcomeHeaderHash,
  commentCount,
  onClose,
}) => {
  // Details is default tab
  const [activeTab, setActiveTab] = useState(ExpandedViewTab.Details)
  const [showing, setShowing] = useState(false)

  useEffect(() => {
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
            projectId={projectId}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            outcome={outcome}
          />
          <EVRightColumn
            projectId={projectId}
            onClose={onClose}
            outcome={outcome}
          />
        </div>
      </CSSTransition>
    </>
  )
}

export default ExpandedViewMode
