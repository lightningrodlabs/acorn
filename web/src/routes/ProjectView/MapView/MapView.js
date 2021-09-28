import React, { useEffect, useRef } from 'react'
import { connect, useStore } from 'react-redux'

import './MapView.css'

import render from '../../../drawing'

import setupEventListeners from '../../../event-listeners'
import { setScreenDimensions } from '../../../screensize/actions'
import { openExpandedView } from '../../../expanded-view/actions'

import EmptyState from '../../../components/ProjectEmptyState/ProjectEmptyState'
import GoalTitleQuickEdit from '../../../components/GoalTitleQuickEdit/GoalTitleQuickEdit'
import VerticalActionsList from '../../../components/VerticalActionsList/VerticalActionsList'
import MultiEditBar from '../../../components/MultiEditBar/MultiEditBar'
import GoalHoverOverlayButtons from '../../../components/GoalHoverOverlayButtons/GoalHoverOverlayButtons'
import EdgeConnectors from '../../../components/EdgeConnectors/EdgeConnectors'
import { firstZoomThreshold } from '../../../drawing/dimensions'

function MapView({
  projectId,
  hasSelection,
  hasHover,
  goalFormIsOpen,
  goalIsBeingEdited,
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
      {showGuidebookHelpMessage && (
        <div className="guidebook_open_help">
          <h3>Click on the Guidebook to learn more</h3>
          <img src="img/arrow-curved.svg" />
        </div>
      )}
      <canvas ref={refCanvas} />
      {showEmptyState && <EmptyState />}
      {/* transform everything in this container according  */}
      {/* to the same scaling and tranlating as the canvas */}
      {/* is being scaled and translated, using css matrix transforms */}
      <div className="transform-container" style={transform}>
        {/* Only present this GoalTitleQuickEdit */}
        {/* if the scale is greater than or equal to 60% (or we are creating a Goal) */}
        {/* because otherwise the font size gets to small and the text is cut off */}
        {goalFormIsOpen && (
          <GoalTitleQuickEdit
            projectId={projectId}
            presentToUser={scale >= firstZoomThreshold || !goalIsBeingEdited}
          />
        )}
      </div>
      {/* below items inside 'goal-form-position-container' maintain their normal scale */}
      {/* while positioning themselves absolutely (position: absolute) on the screen */}
      {/* in coordinates that match with the goals being drawn on the canvas */}
      <div className="goal-form-position-container">
        {goalFormIsOpen && goalIsBeingEdited && (
          <VerticalActionsList projectId={projectId} />
        )}
        {hasHover && (
          <GoalHoverOverlayButtons onExpandClick={openExpandedView} />
        )}
        {/* an undefined value of refCanvas.current was causing a crash, due to canvas prop being undefined */}
        {refCanvas.current && <EdgeConnectors canvas={refCanvas.current} />}
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
    // map from an array type (the selectedGoals) to a simple boolean type
    hasSelection: state.ui.selection.selectedGoals.length > 0,
    hasHover:
      state.ui.hover.hoveredGoal &&
      state.ui.hover.hoveredGoal !== state.ui.goalForm.editAddress,
    goalFormIsOpen: state.ui.goalForm.isOpen,
    goalIsBeingEdited: state.ui.goalForm.editAddress, // is a Goal being edited, not created
    translate: state.ui.viewport.translate,
    scale: state.ui.viewport.scale,
    // TODO: make this also based on whether the user has just registered (created their profile)
    showEmptyState:
      !!state.agentAddress &&
      ((state.projects.goals[projectId] &&
        Object.values(state.projects.goals[projectId]).length === 0) ||
        // project is loading
        !state.projects.goals[projectId]),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapView)
