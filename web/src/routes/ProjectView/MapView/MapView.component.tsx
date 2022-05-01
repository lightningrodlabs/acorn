import React, { useContext, useEffect, useRef } from 'react'
import { useStore } from 'react-redux'

import render from '../../../drawing'
import setupEventListeners from '../../../event-listeners'
import { setScreenDimensions } from '../../../redux/ephemeral/screensize/actions'

import EmptyState from '../../../components/ProjectEmptyState/ProjectEmptyState'
import MultiEditBar from '../../../components/MultiEditBar/MultiEditBar.connector'
import ConnectionConnectors from '../../../components/ConnectionConnectors/ConnectionConnectors.connector'
import MapViewOutcomeTitleForm from '../../../components/MapViewOutcomeTitleForm/MapViewOutcomeTitleForm.connector'
import './MapView.scss'
import ComputedOutcomeContext from '../../../context/ComputedOutcomeContext'

function MapView({
  projectId,
  hasSelection,
  outcomeFormIsOpen,
  translate,
  scale,
  showEmptyState,
}) {
  const store = useStore()
  const refCanvas = useRef()

  const { computedOutcomesKeyed } = useContext(ComputedOutcomeContext)

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
    render(store, computedOutcomesKeyed, canvas)
    const unsub = store.subscribe(() => {
      render(store, computedOutcomesKeyed, canvas)
    })

    return function cleanup() {
      unsub()
      removeEventListeners()
    }
  }, [computedOutcomesKeyed]) // only run on initial mount

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
        {/* <div className="transform-container" style={transform}></div> */}
        {/* Only present this OutcomeTitleQuickEdit */}

        {/* if the scale is greater than or equal to 60% (or we are creating a Outcome) */}
        {/* because otherwise the font size gets to small and the text is cut off */}
        {outcomeFormIsOpen && (
          <MapViewOutcomeTitleForm
            projectId={projectId}
          />
        )}
      </div>

      {/* below items inside 'outcome-form-position-container' maintain their normal scale */}
      {/* while positioning themselves absolutely (position: absolute) on the screen */}
      {/* in coordinates that match with the outcomes being drawn on the canvas */}
      <div className="outcome-form-position-container">
        {/* an undefined value of refCanvas.current was causing a crash, due to canvas prop being undefined */}
        {refCanvas.current && (
          <ConnectionConnectors canvas={refCanvas.current} />
        )}
      </div>

      <MultiEditBar projectId={projectId} hasSelection={hasSelection} />
    </>
  )
}

export default MapView
