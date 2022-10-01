import React, { useContext, useEffect, useRef } from 'react'
import { useStore } from 'react-redux'

import render from '../../../drawing'
import setupEventListeners from '../../../event-listeners'
import { setScreenDimensions } from '../../../redux/ephemeral/screensize/actions'

import ProjectEmptyState from '../../../components/ProjectEmptyState/ProjectEmptyState'
import MultiEditBar from '../../../components/MultiEditBar/MultiEditBar.connector'
import OutcomeConnectors from '../../../components/OutcomeConnectors/OutcomeConnectors.connector'
import MapViewOutcomeTitleForm from '../../../components/MapViewOutcomeTitleForm/MapViewOutcomeTitleForm.connector'
import './MapView.scss'
import ComputedOutcomeContext from '../../../context/ComputedOutcomeContext'
import { CellIdString } from '../../../types/shared'
import { RootState } from '../../../redux/reducer'
import selectRenderProps from './selector'

export type MapViewProps = {
  projectId: CellIdString
  hasMultiSelection: boolean
  outcomeFormIsOpen: boolean
  translate: {
    x: number
    y: number
  }
  zoomLevel: number
  showEmptyState: boolean
}

const MapView: React.FC<MapViewProps> = ({
  projectId,
  showEmptyState,
  zoomLevel,
  translate,
  outcomeFormIsOpen,
  hasMultiSelection,
}) => {
  const store = useStore()
  const refCanvas = useRef<HTMLCanvasElement>()

  const { computedOutcomesKeyed } = useContext(ComputedOutcomeContext)

  // only run this one on initial mount
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
  }, [])
  
  // set this up newly, any time the
  // outcomes and connections change
  useEffect(() => {
    const canvas = refCanvas.current
    // attach keyboard and mouse events
    const removeEventListeners = setupEventListeners(store, canvas, computedOutcomesKeyed)
    const doRender = () => {
      const state: RootState = store.getState()
      const activeProject = state.ui.activeProject
      if (activeProject) {
        const renderProps = selectRenderProps({
          state,
          computedOutcomesKeyed,
          activeProject,
        })
        render(renderProps, canvas)
      }
    }
    // do initial render
    doRender()
    // re-render any time an action is dispatched
    const unsub = store.subscribe(doRender)
    return function cleanup() {
      removeEventListeners()
      unsub()
    }
  }, [computedOutcomesKeyed])

  const transform = {
    transform: `matrix(${zoomLevel}, 0, 0, ${zoomLevel}, ${translate.x}, ${translate.y})`,
  }
  return (
    <>
      {showEmptyState && <ProjectEmptyState />}
      <canvas ref={refCanvas} />
      {/* transform everything in this container according  */}
      {/* to the same scaling and tranlating as the canvas */}
      {/* is being scaled and translated, using css matrix transforms */}
      <div className="transform-container" style={transform}>
        {/* <div className="transform-container" style={transform}></div> */}
        {/* Only present this OutcomeTitleQuickEdit */}

        {/* if the scale is greater than or equal to 60% (or we are creating an Outcome) */}
        {/* because otherwise the font size gets to small and the text is cut off */}
        {outcomeFormIsOpen && <MapViewOutcomeTitleForm projectId={projectId} />}
      </div>

      {/* below items inside 'outcome-form-position-container' maintain their normal scale */}
      {/* while positioning themselves absolutely (position: absolute) on the screen */}
      {/* in coordinates that match with the outcomes being drawn on the canvas */}
      <div className="outcome-form-position-container">
        {/* an undefined value of refCanvas.current was causing a crash, due to canvas prop being undefined */}
        {refCanvas.current && (
          <OutcomeConnectors canvas={refCanvas.current} outcomes={computedOutcomesKeyed} />
        )}
      </div>

      <MultiEditBar projectId={projectId} hasMultiSelection={hasMultiSelection} />
    </>
  )
}

export default MapView
