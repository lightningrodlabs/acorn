import { coordsPageToCanvas } from '../drawing/coordinateSystems'
import { openExpandedView } from '../redux/ephemeral/expanded-view/actions'
import { openOutcomeForm } from '../redux/ephemeral/outcome-form/actions'
import { RootState } from '../redux/reducer'
import { ComputedOutcome } from '../types/outcome'
import { ActionHashB64 } from '../types/shared'
import checkForOutcomeOrConnection, {
  OutcomeConnectionOrBoth,
} from './helpers/checkForOutcomeOrConnection'

export default function canvasDoubleclick(
  store: any,
  outcomes: { [actionHash: ActionHashB64]: ComputedOutcome },
  event: MouseEvent
) {
  const state: RootState = store.getState()
  const {
    ui: {
      viewport: { translate, scale },
    },
  } = state
  const checks = checkForOutcomeOrConnection(
    OutcomeConnectionOrBoth.Outcome,
    state,
    event.clientX,
    event.clientY,
    outcomes
  )
  if (checks.outcomeActionHash) {
    store.dispatch(openExpandedView(checks.outcomeActionHash))
  } else {
    const canvasPoint = coordsPageToCanvas(
      {
        x: event.clientX,
        y: event.clientY,
      },
      translate,
      scale
    )
    store.dispatch(
      openOutcomeForm({
        leftConnectionXPosition: canvasPoint.x,
        topConnectionYPosition: canvasPoint.y,
        editAddress: null,
        maybeLinkedOutcome: null,
        existingParentConnectionAddress: null,
      })
    )
  }
}
