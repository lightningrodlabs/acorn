import { coordsPageToCanvas } from '../drawing/coordinateSystems'
import { unsetMousedown } from '../redux/ephemeral/mouse/actions'
import handleOutcomeConnectorMouseUp from '../redux/ephemeral/outcome-connector/handler'
import { nearEdgePanning } from '../redux/ephemeral/outcome-connector/actions'
import { openOutcomeForm } from '../redux/ephemeral/outcome-form/actions'
import { RootState } from '../redux/reducer'
import { LinkedOutcomeDetails } from '../types'
import { ActionHashB64, Option } from '../types/shared'
import { AppAgentClient } from '@holochain/client'

export default function canvasMouseup(appWebsocket: AppAgentClient, store: any, event: MouseEvent) {
  const state: RootState = store.getState()
  const {
    maybeLinkedOutcome,
    toAddress,
    existingParentConnectionAddress,
  } = state.ui.outcomeConnector
  const { activeProject } = state.ui

  // if we are using the Connection Connector
  if (maybeLinkedOutcome) {
    // covers the case where we are hovered over an Outcome
    // and thus making a connection to an existing Outcome
    // AS WELL AS the case where we are not
    // (to reset the connection connector)
    handleOutcomeConnectorMouseUp(
      appWebsocket,
      maybeLinkedOutcome,
      toAddress,
      existingParentConnectionAddress,
      activeProject,
      store.dispatch
    )
    // covers the case where we are not hovered over an Outcome
    // and thus making a new Outcome and connection/Connection
    if (!toAddress) {
      // here we transfer the `maybeLinkedOutcome` from the Outcome Connector
      // state over to the Outcome Form state
      handleMouseUpForOutcomeForm({
        state,
        event,
        store,
        maybeLinkedOutcome,
        existingParentConnectionAddress,
      })
    }
  }

  if (state.ui.outcomeConnector.nearEdgePanning) {
    window.clearInterval(state.ui.outcomeConnector.nearEdgePanning)
    store.dispatch(nearEdgePanning())
  }

  // update the mouse aware state
  store.dispatch(unsetMousedown())
}

function handleMouseUpForOutcomeForm({
  state,
  event,
  store,
  maybeLinkedOutcome,
  existingParentConnectionAddress,
}: {
  state: RootState
  event: MouseEvent
  store: any // redux store, for the sake of dispatch
  maybeLinkedOutcome: Option<LinkedOutcomeDetails>
  existingParentConnectionAddress?: ActionHashB64
}) {
  const calcedPoint = coordsPageToCanvas(
    {
      x: event.clientX,
      y: event.clientY,
    },
    state.ui.viewport.translate,
    state.ui.viewport.scale
  )
  store.dispatch(
    openOutcomeForm({
      topConnectionYPosition: calcedPoint.y,
      leftConnectionXPosition: calcedPoint.x,
      editAddress: null,
      maybeLinkedOutcome,
      existingParentConnectionAddress,
    })
  )
}
