import React from 'react'
import { CSSTransition } from 'react-transition-group'
import ButtonClose from '../ButtonClose/ButtonClose'
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs'
import { ComputedOutcome } from '../../types'
import { ActionHashB64 } from '../../types/shared'
import './ExpandedViewModeModalWrapper.scss' // Import new SCSS file

export type ExpandedViewModeModalWrapperProps = {
  showing: boolean
  onClose: () => void
  children: React.ReactNode // To render ExpandedViewModeInner
  outcomeAndAncestors: ComputedOutcome[]
  openExpandedView: (actionHash: ActionHashB64) => void
}

const ExpandedViewModeModalWrapper: React.FC<ExpandedViewModeModalWrapperProps> = ({
  showing,
  onClose,
  children,
  outcomeAndAncestors,
  openExpandedView,
}) => {
  return (
    <>
      {/* Overlay */}
      <CSSTransition
        in={showing}
        timeout={100}
        unmountOnExit
        classNames="expanded-view-overlay-transition" // Use specific class name prefix
      >
        <div className="expanded-view-overlay" onClick={onClose}></div>
      </CSSTransition>

      {/* Breadcrumbs */}
      <CSSTransition
        in={showing}
        timeout={100}
        unmountOnExit
        classNames="breadcrumbs-overlay-transition" // Use specific class name prefix
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

      {/* Main Modal Wrapper */}
      <CSSTransition
        in={showing}
        timeout={100}
        unmountOnExit
        classNames="expanded-view-wrapper-transition" // Use specific class name prefix
      >
        {/* This div applies the modal positioning, background, shadow etc. */}
        <div className="expanded-view-modal-wrapper">
          {/* Close button specific to the modal */}
          <ButtonClose onClick={onClose} size="medium" />
          {/* Render the inner content */}
          {children}
        </div>
      </CSSTransition>
    </>
  )
}

export default ExpandedViewModeModalWrapper
