import _ from 'lodash'
import ProjectsZomeApi from '../api/projectsApi'
import { alterSiblingOrder } from '../connections'
import { getAppWs } from '../hcWebsockets'
import { openExpandedView } from '../redux/ephemeral/expanded-view/actions'
import { setShiftKeyDown } from '../redux/ephemeral/keyboard/actions'
import { triggerUpdateLayout } from '../redux/ephemeral/layout/actions'
import { COORDINATES } from '../redux/ephemeral/local-preferences/reducer'
import {
  setNavModalOpenChildren,
  setNavModalOpenParents,
} from '../redux/ephemeral/navigation-modal/actions'
import { setOutcomeClone } from '../redux/ephemeral/outcome-clone/actions'
import { resetOutcomeConnector } from '../redux/ephemeral/outcome-connector/actions'
import { closeOutcomeForm } from '../redux/ephemeral/outcome-form/actions'
import { unselectAll } from '../redux/ephemeral/selection/actions'
import { animatePanAndZoom } from '../redux/ephemeral/viewport/actions'
import { deleteConnection } from '../redux/persistent/projects/connections/actions'
import { deleteOutcomeFully } from '../redux/persistent/projects/outcomes/actions'
import { RootState } from '../redux/reducer'
import {
  findChildrenActionHashes,
  findParentsActionHashes,
  findSiblingActionHash,
  RightOrLeft,
} from '../tree-logic'
import { ActionHashB64 } from '../types/shared'
import { cellIdFromString } from '../utils'
import cloneOutcomes from './helpers/cloneOutcomes'
import checkForKeyboardKeyModifier from './helpers/osPlatformHelper'
import { AppClient } from '@holochain/client'

function leftMostOutcome(
  outcomeActionHashes: ActionHashB64[],
  state: RootState
): ActionHashB64 {
  return _.minBy(outcomeActionHashes, (actionHash) => {
    return state.ui.layout.coordinates[actionHash].x
  })
}

export default async function bodyKeydown(
  _appWebsocket: AppClient,
  store: any,
  event: KeyboardEvent
) {
  function canPerformKeyboardAction(state: RootState): boolean {
    return (
      state.ui.selection.selectedOutcomes.length === 1 &&
      !state.ui.outcomeForm.isOpen &&
      !state.ui.expandedView.isOpen &&
      !state.ui.navigationModal.open
    )
  }

  function getKeyboardNavigationPreference(state: RootState): string {
    return state.ui.localPreferences.keyboardNavigation
  }

  function panAndZoom(actionHash: string) {
    store.dispatch(animatePanAndZoom(actionHash, false))
  }

  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  let state: RootState = store.getState()
  const {
    ui: { activeProject },
  } = state
  const cellId = cellIdFromString(activeProject)
  // there are event.code and event.key ...
  // event.key is keyboard layout independent, so works for Dvorak users
  switch (event.key) {
    case 'Enter':
      if (canPerformKeyboardAction(state)) {
        event.stopPropagation()
        store.dispatch(openExpandedView(state.ui.selection.selectedOutcomes[0]))
      }

      break

    // Used for navigating to a child
    case 'ArrowDown':
      if (canPerformKeyboardAction(state)) {
        const selectedOutcome = state.ui.selection.selectedOutcomes[0]

        const childrenActionHashes = findChildrenActionHashes(
          selectedOutcome,
          state
        )
        if (childrenActionHashes.length) {
          event.stopPropagation()
          const keyboardNavPreference = getKeyboardNavigationPreference(state)
          if (childrenActionHashes.length === 1) {
            panAndZoom(childrenActionHashes[0])
          } else if (keyboardNavPreference === COORDINATES) {
            // navigate to the left-most child
            const leftMostChild = leftMostOutcome(childrenActionHashes, state)
            panAndZoom(leftMostChild)
          } else {
            store.dispatch(setNavModalOpenChildren(childrenActionHashes))
          }
        }
      }
      break

    // Used for navigating to a parent
    case 'ArrowUp':
      if (canPerformKeyboardAction(state)) {
        const selectedOutcome = state.ui.selection.selectedOutcomes[0]
        const parentsActionHashes = findParentsActionHashes(
          selectedOutcome,
          state
        )
        if (parentsActionHashes.length) {
          event.stopPropagation()
          const keyboardNavPreference = getKeyboardNavigationPreference(state)
          if (parentsActionHashes.length === 1) {
            panAndZoom(parentsActionHashes[0])
          } else if (keyboardNavPreference === COORDINATES) {
            // navigate to the left most parent
            const leftMostParent = leftMostOutcome(parentsActionHashes, state)
            panAndZoom(leftMostParent)
          } else {
            store.dispatch(setNavModalOpenParents(parentsActionHashes))
          }
        }
      }

      break

    // Used for navigating to the left sibling
    case 'ArrowLeft':
      if (canPerformKeyboardAction(state)) {
        const selectedOutcome = state.ui.selection.selectedOutcomes[0]
        const targetActionHash = findSiblingActionHash(
          selectedOutcome,
          state,
          RightOrLeft.Left
        )
        if (event.shiftKey && targetActionHash) {
          // only do this if selected outcome has a left sibling
          // move the selected outcome to the left side of the left sibling
          // (swap positions with the left sibling)
          alterSiblingOrder(
            appWebsocket,
            store,
            state,
            selectedOutcome,
            targetActionHash,
            RightOrLeft.Left
          )
        } else if (targetActionHash) {
          // select and pan and zoom to
          // the parent
          store.dispatch(animatePanAndZoom(targetActionHash, false))
        }
      }
      break

    // Used for navigating to the right sibling
    case 'ArrowRight':
      if (canPerformKeyboardAction(state)) {
        const selectedOutcome = state.ui.selection.selectedOutcomes[0]
        const targetActionHash = findSiblingActionHash(
          selectedOutcome,
          state,
          RightOrLeft.Right
        )
        if (event.shiftKey && targetActionHash) {
          // only do this if selected outcome has a right sibling
          // move the selected outcome to the right side of the right sibling
          // (swap positions with the right sibling)
          alterSiblingOrder(
            appWebsocket,
            store,
            state,
            selectedOutcome,
            targetActionHash,
            RightOrLeft.Right
          )
        } else if (targetActionHash) {
          // select and pan and zoom to
          // the parent
          store.dispatch(animatePanAndZoom(targetActionHash, false))
        }
      }
      break

    // Used in multi selecting Outcomes
    case 'Shift':
      store.dispatch(setShiftKeyDown())
      break
    case 'Escape':
      // Only unselect all Outcomes if the expanded view
      // is not open
      if (!state.ui.expandedView.isOpen && !state.ui.navigationModal.open) {
        store.dispatch(unselectAll())
      }
      store.dispatch(closeOutcomeForm())
      store.dispatch(resetOutcomeConnector())
      break
    case 'Backspace':
      let selection = state.ui.selection
      // only dispatch if something's selected and the OutcomeForm and ExpandedView are
      // not open
      if (
        selection.selectedConnections.length > 0 &&
        !state.ui.outcomeForm.isOpen &&
        !state.ui.expandedView.isOpen
      ) {
        // if on firefox, and matched this case
        // prevent the browser from navigating back to the last page
        event.preventDefault()
        for await (const connection of selection.selectedConnections) {
          await projectsZomeApi.connection.delete(cellId, connection)
          store.dispatch(deleteConnection(activeProject, connection))
          // this action will trigger a recalc
          // and layout animation update, which is natural in this context.
          // we have to trigger it manually because there is a scenario where
          // deleteConnection should NOT trigger a layout recalc
          store.dispatch(triggerUpdateLayout())
        }
      } else if (
        selection.selectedOutcomes.length > 0 &&
        !state.ui.outcomeForm.isOpen &&
        !state.ui.expandedView.isOpen
      ) {
        // if on firefox, and matched this case
        // prevent the browser from navigating back to the last page
        event.preventDefault()
        for await (const outcome of selection.selectedOutcomes) {
          const fullyDeletedOutcome = await projectsZomeApi.outcome.deleteOutcomeFully(
            cellId,
            outcome
          )
          store.dispatch(deleteOutcomeFully(activeProject, fullyDeletedOutcome))
        }
      }
      break
    case 'c':
      if (
        checkForKeyboardKeyModifier(event) &&
        state.ui.selection.selectedOutcomes.length &&
        !state.ui.outcomeForm.isOpen &&
        !state.ui.expandedView.isOpen
      ) {
        store.dispatch(setOutcomeClone(state.ui.selection.selectedOutcomes))
      }
      break
    case 'v':
      if (
        checkForKeyboardKeyModifier(event) &&
        state.ui.outcomeClone.outcomes.length &&
        !state.ui.outcomeForm.isOpen &&
        !state.ui.expandedView.isOpen
      ) {
        cloneOutcomes(appWebsocket, store)
      }
      break
    default:
      // console.log(event)
      break
  }
  // console.log(event)
}
