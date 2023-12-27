import { coordsPageToCanvas } from '../drawing/coordinateSystems'
import { OUTCOME_VERTICAL_HOVER_ALLOWANCE } from '../drawing/dimensions'
import { checkForOutcomeAtCoordinatesInBox } from '../drawing/eventDetection'
import {
  hoverConnection,
  unhoverConnection,
  hoverOutcome,
  unhoverOutcome,
} from '../redux/ephemeral/hover/actions'
import {
  setLiveCoordinate,
  setClosestOutcome,
  setOutcomes,
} from '../redux/ephemeral/mouse/actions'
import {
  nearEdgePanning,
  setOutcomeConnectorTo,
} from '../redux/ephemeral/outcome-connector/actions'
import { changeTranslate } from '../redux/ephemeral/viewport/actions'
import { RootState } from '../redux/reducer'
import { ComputedOutcome } from '../types'
import { ActionHashB64 } from '../types/shared'
import checkForOutcomeOrConnection, {
  OutcomeConnectionOrBoth,
} from './helpers/checkForOutcomeOrConnection'
import closestOutcomeToPageCoord from './helpers/closestOutcome'

// this method is being called super frequently, and is not performance optimized
// and seems to be dragging down the performance as a bottleneck.
export default function canvasMousemove(
  store: any,
  outcomes: { [actionHash: ActionHashB64]: ComputedOutcome },
  event: MouseEvent
) {
  const state: RootState = store.getState()
  const {
    ui: {
      viewport: { translate, scale },
      mouse: {
        coordinate: { x: initialSelectX, y: initialSelectY },
      },
      layout: {
        coordinates: outcomesCoordinates,
        dimensions: outcomesDimensions,
      },
    },
  } = state

  const convertedCurrentMouse = coordsPageToCanvas(
    {
      x: event.clientX,
      y: event.clientY,
    },
    translate,
    scale
  )
  store.dispatch(setLiveCoordinate(convertedCurrentMouse))

  const closestOutcome = closestOutcomeToPageCoord(
    convertedCurrentMouse,
    outcomesCoordinates
  )
  // store the closest outcome, if there is one
  store.dispatch(setClosestOutcome(closestOutcome))

  // this only is true if the CANVAS was clicked
  // meaning it is not true if e.g. an OutcomeConnector html element
  // was clicked
  if (state.ui.mouse.mousedown) {
    if (event.shiftKey) {
      const outcomeActionHashesToSelect = checkForOutcomeAtCoordinatesInBox(
        outcomesCoordinates,
        outcomesDimensions,
        outcomes,
        convertedCurrentMouse,
        { x: initialSelectX, y: initialSelectY }
      )
      store.dispatch(setOutcomes(outcomeActionHashesToSelect))
    } else {
      store.dispatch(changeTranslate(event.movementX, event.movementY))
    }
    // return
  }

  // for hover, we use OUTCOME_VERTICAL_HOVER_ALLOWANCE
  // to make it so that the OutcomeConnector can display
  // without glitchiness
  const checks = checkForOutcomeOrConnection(
    OutcomeConnectionOrBoth.Both,
    state,
    event.clientX,
    event.clientY,
    outcomes,
    OUTCOME_VERTICAL_HOVER_ALLOWANCE
  )
  if (
    checks.connectionActionHash &&
    state.ui.hover.hoveredConnection !== checks.connectionActionHash
  ) {
    store.dispatch(hoverConnection(checks.connectionActionHash))
  } else if (!checks.connectionActionHash && state.ui.hover.hoveredConnection) {
    store.dispatch(unhoverConnection())
  }

  // edge-of-screen panning, during Outcome linking user action

  // check if 'near the edge of the screen', per a threshold
  // Define the threshold in pixels
  const threshold = 40
  // Get mouse position
  const mouseX = event.clientX
  const mouseY = event.clientY
  // Get window dimensions
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  // Calculate distance from each edge
  const distanceFromLeft = mouseX
  const distanceFromRight = windowWidth - mouseX
  const distanceFromTop = mouseY
  const distanceFromBottom = windowHeight - mouseY

  const isNearEdge =
    distanceFromLeft < threshold ||
    distanceFromRight < threshold ||
    distanceFromTop < threshold ||
    distanceFromBottom < threshold
  // if near, then start panning
  if (
    state.ui.outcomeConnector.maybeLinkedOutcome &&
    !state.ui.outcomeConnector.nearEdgePanning &&
    isNearEdge
  ) {
    // which direction to pan in X
    const xSign = distanceFromLeft < threshold ? 1 : -1
    // which direction to pan in Y
    const ySign = distanceFromTop < threshold ? 1 : -1

    // how much to pan on each repition in X (in points)
    const xAmount =
      distanceFromLeft < threshold || distanceFromRight < threshold ? 8 : 0
    // how much to pan on each repition in Y (in points)
    const yAmount =
      distanceFromTop < threshold || distanceFromBottom < threshold ? 8 : 0

    // how frequently in milliseconds to pan
    const panFrequencyMilliseconds = 10
    const t = window.setInterval(() => {
      store.dispatch(
        changeTranslate(xSign * xAmount, ySign * yAmount, {
          scale: state.ui.viewport.scale,
        })
      )
    }, panFrequencyMilliseconds)
    store.dispatch(nearEdgePanning(t))
  }

  if (state.ui.outcomeConnector.nearEdgePanning && !isNearEdge) {
    // setting to false/undefined
    window.clearInterval(state.ui.outcomeConnector.nearEdgePanning)
    store.dispatch(nearEdgePanning())
  }
  // if was near, and now no longer, then stop panning

  // outcome hover state, and unhover
  // PLUS 'connection connector'
  if (
    checks.outcomeActionHash &&
    state.ui.hover.hoveredOutcome !== checks.outcomeActionHash
  ) {
    store.dispatch(hoverOutcome(checks.outcomeActionHash))
    // hook up if the connection connector to a new Outcome
    // if we are using the connection connector
    // and IMPORTANTLY if Outcome is in the list of `validToAddresses`
    if (
      state.ui.outcomeConnector.maybeLinkedOutcome &&
      state.ui.outcomeConnector.validToAddresses.includes(
        checks.outcomeActionHash
      )
    ) {
      store.dispatch(setOutcomeConnectorTo(checks.outcomeActionHash))
    }
  } else if (!checks.outcomeActionHash && state.ui.hover.hoveredOutcome) {
    store.dispatch(unhoverOutcome())
    store.dispatch(setOutcomeConnectorTo(null))
  }
}
