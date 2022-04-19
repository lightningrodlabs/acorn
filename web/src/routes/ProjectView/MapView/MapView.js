import React, { useEffect, useRef } from 'react'
import { connect, useStore } from 'react-redux'

import './MapView.scss'

import render from '../../../drawing'

import setupEventListeners from '../../../event-listeners'
import { setScreenDimensions } from '../../../redux/ephemeral/screensize/actions'
import { openExpandedView } from '../../../redux/ephemeral/expanded-view/actions'

import EmptyState from '../../../components/ProjectEmptyState/ProjectEmptyState'
import OutcomeTitleQuickEdit from '../../../components/OutcomeTitleQuickEdit/OutcomeTitleQuickEdit.connector'
import VerticalActionsList from '../../../components/VerticalActionsList/VerticalActionsList.connector'
import MultiEditBar from '../../../components/MultiEditBar/MultiEditBar.connector'
import OutcomeHoverOverlayButtons from '../../../components/OutcomeHoverOverlayButtons/OutcomeHoverOverlayButtons.connector'
import ConnectionConnectors from '../../../components/ConnectionConnectors/ConnectionConnectors.connector'
import { firstZoomThreshold } from '../../../drawing/dimensions'


function MapView({
  projectId,
  hasSelection,
  hasHover,
  outcomeFormIsOpen,
  outcomeIsBeingEdited,
  translate,
  scale,
  openExpandedView,
  showEmptyState,
  showGuidebookHelpMessage,
}) {
  const store = useStore()
  const refCanvas = useRef()

  useEffect(() => {
    const canvas = refCanvas.current
    canvas.width = document.body.clientWidth
    canvas.height = document.body.clientHeight
    // Get the device pixel ratio, falling back to 1.
    const dpr = window.devicePixelRatio || 1
    // Get the size of the canvas in CSS pixels.
    const rect = canvas.getBoundingClientRect()
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    store.dispatch(setScreenDimensions(rect.width * dpr, rect.height * dpr))
    // attach keyboard and mouse events
    const removeEventListeners = setupEventListeners(store, canvas)
    render(store, canvas)
    const unsub = store.subscribe(() => {
      render(store, canvas)
    })

    return function cleanup() {
      unsub()
      removeEventListeners()
    }
  }, []) // only run on initial mount

  const transform = {
    transform: `matrix(${scale}, 0, 0, ${scale}, ${translate.x}, ${translate.y})`,
  }
  return (
    <>
    {/* TODO: Guidebook to be replaced with External help button */}
      {/* {showGuidebookHelpMessage && (
        <div className="guidebook_open_help">
          <h4>Click on the Guidebook to learn more</h4>
          <img src="img/arrow-curved.svg" />
        </div>
      )} */}
      <canvas ref={refCanvas} />
      {showEmptyState && <EmptyState />}
      {/* transform everything in this container according  */}
      {/* to the same scaling and tranlating as the canvas */}
      {/* is being scaled and translated, using css matrix transforms */}
      <div className="transform-container" style={transform}>
        {/* Only present this OutcomeTitleQuickEdit */}
        {/* if the scale is greater than or equal to 60% (or we are creating a Outcome) */}
        {/* because otherwise the font size gets to small and the text is cut off */}
        {outcomeFormIsOpen && (
          <OutcomeTitleQuickEdit
            projectId={projectId}
            presentToUser={scale >= firstZoomThreshold || !outcomeIsBeingEdited}
          />
        )}
      </div>
      {/* below items inside 'outcome-form-position-container' maintain their normal scale */}
      {/* while positioning themselves absolutely (position: absolute) on the screen */}
      {/* in coordinates that match with the outcomes being drawn on the canvas */}
      <div className="outcome-form-position-container">
        {outcomeFormIsOpen && outcomeIsBeingEdited && (
          <VerticalActionsList projectId={projectId} />
        )}
        {hasHover && (
          <OutcomeHoverOverlayButtons onExpandClick={openExpandedView} />
        )}
        {/* an undefined value of refCanvas.current was causing a crash, due to canvas prop being undefined */}
        {refCanvas.current && <ConnectionConnectors canvas={refCanvas.current} />}
      </div>

      <MultiEditBar projectId={projectId} hasSelection={hasSelection} />
    </>
  )
}

function mapDispatchToProps(dispatch) {
  return {
    openExpandedView: (address) => dispatch(openExpandedView(address)),
  }
}

function mapStateToProps(state) {
  const projectId = state.ui.activeProject
  return {
    // if have not opened the guidebook ever, then show guidebook tip message
    showGuidebookHelpMessage: !state.ui.localPreferences.hasAccessedGuidebook,
    projectId,
    // map from an array type (the selectedOutcomes) to a simple boolean type
    hasSelection: state.ui.selection.selectedOutcomes.length > 0,
    hasHover:
      state.ui.hover.hoveredOutcome &&
      state.ui.hover.hoveredOutcome !== state.ui.outcomeForm.editAddress,
    outcomeFormIsOpen: state.ui.outcomeForm.isOpen,
    outcomeIsBeingEdited: state.ui.outcomeForm.editAddress, // is a Outcome being edited, not created
    translate: state.ui.viewport.translate,
    scale: state.ui.viewport.scale,
    // TODO: make this also based on whether the user has just registered (created their profile)
    showEmptyState:
      !!state.agentAddress &&
      ((state.projects.outcomes[projectId] &&
        Object.values(state.projects.outcomes[projectId]).length === 0) ||
        // project is loading
        !state.projects.outcomes[projectId]),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapView)
