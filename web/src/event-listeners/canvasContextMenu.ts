import { setContextMenu } from '../redux/ephemeral/mouse/actions'
import { RootState } from '../redux/reducer'
import { ComputedOutcome } from '../types'
import { ActionHashB64 } from '../types/shared'
import checkForOutcomeOrConnection, {
  OutcomeConnectionOrBoth,
} from './helpers/checkForOutcomeOrConnection'

export default function canvasContextMenu(
  store: any,
  outcomes: { [actionHash: ActionHashB64]: ComputedOutcome },
  event: MouseEvent
) {
  event.preventDefault()
  const state: RootState = store.getState()
  const checks = checkForOutcomeOrConnection(
    OutcomeConnectionOrBoth.Outcome,
    state,
    event.clientX,
    event.clientY,
    outcomes
  )
  // at this time, we are only displaying the ContextMenu if you
  // right-clicked ON an Outcome
  if (checks.outcomeActionHash) {
    store.dispatch(
      setContextMenu(checks.outcomeActionHash, {
        x: event.clientX,
        y: event.clientY,
      })
    )
  }
}
