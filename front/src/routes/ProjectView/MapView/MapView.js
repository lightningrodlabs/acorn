import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { connect, useStore } from 'react-redux'
import './MapView.css'

import './MapView.css'

import render from '../../../drawing'

import setupEventListeners from '../../../event-listeners'
import {
  openExpandedView,
  closeExpandedView,
} from '../../../expanded-view/actions'
import { setScreenDimensions } from '../../../screensize/actions'
import EmptyState from '../../../components/ProjectEmptyState/ProjectEmptyState'
import GoalForm from '../../../components/GoalForm'
import MultiEditBar from '../../../components/MultiEditBar/MultiEditBar'
import HoverOverlay from '../../../components/HoverOverlay'
import ExpandedViewMode from '../../../components/ExpandedViewMode/ExpandedViewMode'
import EdgeConnectors from '../../../components/EdgeConnectors/EdgeConnectors'

function MapView({
  projectId,
  hasSelection,
  hasHover,
  goalFormIsOpen,
  translate,
  scale,
  openExpandedView,
  closeExpandedView,
  showEmptyState,
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
      {/* TODO: make this show based on whether the user has just recently created their profile (registered) */}
      <div className='guidebook_open_help'>
        <div>Click on the Guidebook to learn more</div>
        <img src='img/arrow-curved.svg' />
      </div>
      <canvas ref={refCanvas} />
      {showEmptyState && <EmptyState />}
      <div className='transform-container' style={transform}>
        {goalFormIsOpen && <GoalForm projectId={projectId} />}
        {hasHover && <HoverOverlay onExpandClick={openExpandedView} />}
        {/* an undefined value of refCanvas.current was causing a crash, due to canvas prop being undefined */}
        {refCanvas.current && <EdgeConnectors canvas={refCanvas.current} />}
      </div>
      <MultiEditBar projectId={projectId} hasSelection={hasSelection} />
      <ExpandedViewMode projectId={projectId} onClose={closeExpandedView} />
    </>
  )
}

MapView.propTypes = {
  projectId: PropTypes.string,
  hasSelection: PropTypes.bool.isRequired, // whether or not there are Goals selected
  hasHover: PropTypes.bool, // whether or not a Goal is hovered over
  goalFormIsOpen: PropTypes.bool.isRequired,
  translate: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }),
  scale: PropTypes.number.isRequired,
  whoami: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    handle: PropTypes.string,
    avatar_url: PropTypes.string,
    address: PropTypes.string,
  }),
  createWhoami: PropTypes.func,
  showExpandedViewMode: PropTypes.bool,
  showEmptyState: PropTypes.bool,
}

function mapDispatchToProps(dispatch) {
  return {
    openExpandedView: address => {
      return dispatch(openExpandedView(address))
    },
    closeExpandedView: () => {
      return dispatch(closeExpandedView())
    },
  }
}

function mapStateToProps(state) {
  const projectId = state.ui.activeProject
  return {
    projectId,
    // map from an array type (the selectedGoals) to a simple boolean type
    hasSelection: state.ui.selection.selectedGoals.length > 0,
    hasHover:
      state.ui.hover.hoveredGoal &&
      state.ui.hover.hoveredGoal !== state.ui.goalForm.editAddress,
    goalFormIsOpen: state.ui.goalForm.isOpen,
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
