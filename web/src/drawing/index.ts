import drawOverlay from './drawOverlay'
import drawSelectBox from './drawSelectBox'
import drawEntryPoints from './drawEntryPoints'
import selectRenderProps from '../routes/ProjectView/MapView/selectRenderProps'
import { ProjectComputedOutcomes } from '../context/ComputedOutcomeContext'
import drawExistingConnections from './drawExistingConnections'
import drawOutcomeGroup from './drawOutcomeGroup'
import drawCreateOutcomeConnection from './drawCreateOutcomeConnection'
import drawConnectionConnector from './drawConnectionConnector'
import setupCanvas from './setupCanvas'

/*
  This file is the entry point for how to render the redux state visually
  onto the screen, using the HTML5 canvas APIs.
  It will iterate through each part of the state that needs rendering
  and use well defined functions for rendering those specific parts
  to the canvas.
*/

// Render is responsible for painting all the existing outcomes & connections,
// as well as the yet to be created (pending) ones (For new Outcome / new Connection / edit Connection)
// render the state contained in store onto the canvas
export default function render(
  {
    projectTags,
    screenWidth,
    screenHeight,
    zoomLevel,
    coordinates,
    dimensions: allOutcomeDimensions,
    translate,
    activeEntryPoints,
    connections,
    outcomeMembers,
    entryPoints,
    projectMeta,
    outcomeConnectorMaybeLinkedOutcome,
    outcomeConnectorToAddress,
    outcomeConnectorExistingParent,
    outcomeFormIsOpen,
    outcomeFormMaybeLinkedOutcome,
    outcomeFormContent,
    outcomeFormLeftConnectionX,
    outcomeFormTopConnectionY,
    outcomeFormExistingParent,
    hoveredConnectionActionHash,
    selectedConnections,
    selectedOutcomes,
    mouseLiveCoordinate,
    shiftKeyDown,
    startedSelection,
    startedSelectionCoordinate,
  }: ReturnType<typeof selectRenderProps>,
  computedOutcomesKeyed: ProjectComputedOutcomes['computedOutcomesKeyed'],
  canvas: HTMLCanvasElement
) {
  // only draw if the project has fully loaded
  if (
    !(
      computedOutcomesKeyed &&
      connections &&
      outcomeMembers &&
      entryPoints &&
      projectMeta
    )
  ) {
    return
  }

  const ctx = setupCanvas(
    canvas,
    screenWidth,
    screenHeight,
    zoomLevel,
    translate
  )

  // massaging the data we're passed into useful formats and segments
  const outcomes = computedOutcomesKeyed
  const topPriorityOutcomes = projectMeta.topPriorityOutcomes
  // converts the outcomes object to an array
  const outcomesAsArray = Object.keys(outcomes).map(
    (actionHash) => outcomes[actionHash]
  )
  // convert the connections object to an array
  const connectionsAsArray = Object.keys(connections).map(
    (actionHash) => connections[actionHash]
  )
  // separate selected and unselected Outcomes
  // in order to create layers behind and in
  // front of the editing highlight overlay
  const unselectedOutcomes = outcomesAsArray.filter((outcome) => {
    return selectedOutcomes.indexOf(outcome.actionHash) === -1
  })
  const selectedOutcomesActual = outcomesAsArray.filter((outcome) => {
    return selectedOutcomes.indexOf(outcome.actionHash) > -1
  })
  // create a list of the entry points that are active
  const activeEntryPointsObjects = activeEntryPoints
    .map((entryPointAddress) => entryPoints[entryPointAddress])
    // drop ones that may be undefined
    .filter((activeEntryPoint) => activeEntryPoint)

  /* START DRAWING */

  // The order of drawing is important, because it determines the layering
  // of the elements on the canvas.

  // Draw all the Connections that exist already
  drawExistingConnections({
    connectionsAsArray,
    coordinates,
    allOutcomeDimensions,
    hoveredConnectionActionHash,
    selectedConnections,
    zoomLevel,
    outcomeFormExistingParent,
    outcomeConnectorExistingParent,
    ctx,
    outcomes,
    selectedOutcomeActionHash:
      // if there is only one selected Outcome, pass it in
      selectedOutcomes.length === 1 ? selectedOutcomes[0] : null,
  })

  // draw all the Outcomes that are not selected
  drawOutcomeGroup({
    outcomesAsArray: unselectedOutcomes,
    coordinates,
    allOutcomeDimensions,
    projectTags,
    topPriorityOutcomes,
    areSelected: false,
    zoomLevel,
    ctx,
  })

  // Draw select box
  if (shiftKeyDown && startedSelection && startedSelectionCoordinate.x !== 0) {
    drawSelectBox(
      startedSelectionCoordinate,
      mouseLiveCoordinate,
      canvas.getContext('2d')
    )
  }

  // Draw Entry Point boxes
  drawEntryPoints(
    ctx,
    activeEntryPointsObjects,
    outcomes,
    connectionsAsArray,
    coordinates,
    allOutcomeDimensions,
    zoomLevel
  )

  // Draw editing highlight semi-transparent overlay.
  if (selectedOutcomes.length > 1 && !shiftKeyDown) {
    // if there are more than 1 Outcomes selected and the Shift key
    // is not held down
    drawOverlay(ctx, 0, 0, screenWidth, screenHeight)
  }

  // Draw selected Outcomes
  drawOutcomeGroup({
    outcomesAsArray: selectedOutcomesActual,
    coordinates,
    allOutcomeDimensions,
    projectTags,
    topPriorityOutcomes,
    areSelected: true,
    zoomLevel,
    ctx,
  })

  // Draw a Connection to a potential new Outcome
  if (outcomeFormIsOpen && outcomeFormMaybeLinkedOutcome) {
    // if there is one in the process of being created.
    drawCreateOutcomeConnection({
      ctx,
      coordinates,
      allOutcomeDimensions,
      projectTags,
      zoomLevel,
      outcomeFormMaybeLinkedOutcome,
      outcomeFormContent,
      outcomeFormLeftConnectionX,
      outcomeFormTopConnectionY,
    })
  }

  // Draw the line during Connection creation
  // (when the user drags on the canvas from an Outcome to another Outcome)
  if (outcomeConnectorMaybeLinkedOutcome) {
    drawConnectionConnector({
      ctx,
      coordinates,
      allOutcomeDimensions,
      mouseLiveCoordinate,
      zoomLevel,
      outcomeConnectorMaybeLinkedOutcome,
      outcomeConnectorToAddress,
    })
  }
}
