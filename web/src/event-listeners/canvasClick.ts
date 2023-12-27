import {
  unsetCoordinate,
  unsetOutcomes,
  unsetContextMenu,
} from '../redux/ephemeral/mouse/actions'
import {
  selectOutcome,
  unselectAll,
  selectConnection,
  unselectOutcome,
} from '../redux/ephemeral/selection/actions'
import { RootState } from '../redux/reducer'
import { ComputedOutcome } from '../types'
import { ActionHashB64 } from '../types/shared'
import checkForOutcomeOrConnection, {
  OutcomeConnectionOrBoth,
} from './helpers/checkForOutcomeOrConnection'

export default function canvasClick(
  store: any,
  outcomes: { [actionHash: ActionHashB64]: ComputedOutcome },
  event: MouseEvent
) {
  const state: RootState = store.getState()
  // outcomesAddresses are Outcomes to be selected
  const {
    ui: {
      mouse: { outcomesAddresses },
    },
  } = state

  if (outcomesAddresses) {
    // finishing a drag box selection action
    outcomesAddresses.forEach((value) => store.dispatch(selectOutcome(value)))
  } else {
    // check for Outcome or Connection at clicked location
    // select it if so
    const checks = checkForOutcomeOrConnection(
      OutcomeConnectionOrBoth.Both,
      state,
      event.clientX,
      event.clientY,
      outcomes
    )
    if (checks.connectionActionHash) {
      store.dispatch(unselectAll())
      store.dispatch(selectConnection(checks.connectionActionHash))
    } else if (checks.outcomeActionHash) {
      // if the shift key is being use, do an 'additive' select
      // where you add the Outcome to the list of selected
      if (!event.shiftKey) {
        store.dispatch(unselectAll())
      }
      // if using shift, and Outcome is already selected, unselect it
      if (
        event.shiftKey &&
        state.ui.selection.selectedOutcomes.indexOf(checks.outcomeActionHash) >
          -1
      ) {
        store.dispatch(unselectOutcome(checks.outcomeActionHash))
      } else {
        store.dispatch(selectOutcome(checks.outcomeActionHash))
      }
    } else {
      // If nothing was selected, that means empty
      // spaces was clicked: deselect everything
      store.dispatch(unselectAll())
    }
  }

  // clear box selection vars
  store.dispatch(unsetCoordinate())
  store.dispatch(unsetOutcomes())
  store.dispatch(unsetContextMenu())
}
