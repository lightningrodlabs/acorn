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
import { setOutcomeConnectorTo } from '../redux/ephemeral/outcome-connector/actions'
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
    return
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
