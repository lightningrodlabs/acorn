import _ from 'lodash'

import { coordsPageToCanvas } from '../drawing/coordinateSystems'
import {
  checkForConnectionAtCoordinates,
  checkForOutcomeAtCoordinates,
  checkForOutcomeAtCoordinatesInBox,
} from '../drawing/eventDetection'
import {
  selectConnection,
  selectOutcome,
  unselectOutcome,
  unselectAll,
} from '../redux/ephemeral/selection/actions'
import {
  hoverOutcome,
  unhoverOutcome,
  hoverConnection,
  unhoverConnection,
} from '../redux/ephemeral/hover/actions'
import {
  setGKeyDown,
  unsetGKeyDown,
  setShiftKeyDown,
  unsetShiftKeyDown,
  setCtrlKeyDown,
  unsetCtrlKeyDown,
} from '../redux/ephemeral/keyboard/actions'
import {
  setMousedown,
  unsetMousedown,
  setLiveCoordinate,
  setCoordinate,
  unsetCoordinate,
  unsetOutcomes,
  setOutcomes,
  setSize,
  unsetSize,
} from '../redux/ephemeral/mouse/actions'
import {
  openOutcomeForm,
  closeOutcomeForm,
  updateContent,
} from '../redux/ephemeral/outcome-form/actions'
import { deleteOutcomeFully } from '../redux/persistent/projects/outcomes/actions'
import { setScreenDimensions } from '../redux/ephemeral/screensize/actions'
import {
  changeTranslate,
  changeScale,
} from '../redux/ephemeral/viewport/actions'
import { closeExpandedView, openExpandedView } from '../redux/ephemeral/expanded-view/actions'
import { MOUSE, TRACKPAD } from '../redux/ephemeral/local-preferences/reducer'

import { setOutcomeClone } from '../redux/ephemeral/outcome-clone/actions'

import cloneOutcomes from './cloneOutcomes'
import {
  resetConnectionConnector,
  setConnectionConnectorTo,
} from '../redux/ephemeral/connection-connector/actions'
import handleConnectionConnectMouseUp from '../redux/ephemeral/connection-connector/handler'
import ProjectsZomeApi from '../api/projectsApi'
import { getAppWs } from '../hcWebsockets'
import { cellIdFromString } from '../utils'
import { triggerUpdateLayout } from '../redux/ephemeral/layout/actions'
import { deleteConnection } from '../redux/persistent/projects/connections/actions'
import { ActionHashB64 } from '../types/shared'
import { ComputedOutcome, RelationInput } from '../types'
import { RootState } from '../redux/reducer'
import { MouseEvent } from 'react'

// ASSUMPTION: one parent (existingParentConnectionAddress)
function handleMouseUpForOutcomeForm({
  state,
  event,
  store,
  fromAddress,
  relation,
  existingParentConnectionAddress,
}: {
  state: RootState
  event: MouseEvent
  store: any // redux store, for the sake of dispatch
  fromAddress?: ActionHashB64
  relation?: RelationInput
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
    // ASSUMPTION: one parent (existingParentConnectionAddress)
    openOutcomeForm(
      calcedPoint.x,
      calcedPoint.y,
      null,
      fromAddress,
      relation,
      existingParentConnectionAddress
    )
  )
}

// outcomes is ComputedOutcomes in an object, keyed by their actionHash
export default function setupEventListeners(
  store,
  canvas: HTMLCanvasElement,
  outcomes: { [actionHash: ActionHashB64]: ComputedOutcome }
) {
  const ctx = canvas.getContext('2d')

  function windowResize(event) {
    // Get the device pixel ratio, falling back to 1.
    const dpr = window.devicePixelRatio || 1
    // Get the size of the canvas in CSS pixels.
    const rect = canvas.getBoundingClientRect()
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    store.dispatch(setScreenDimensions(rect.width * dpr, rect.height * dpr))
  }

  async function bodyKeydown(event) {
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
      case 'g':
        // only dispatch SET_G_KEYDOWN if it's not already down
        if (state.ui.keyboard.gKeyDown) {
          event.preventDefault()
        } else {
          store.dispatch(setGKeyDown())
        }
        break
      case 'Enter':
        if (
          state.ui.selection.selectedOutcomes.length === 1 &&
          !state.ui.outcomeForm.isOpen &&
          !state.ui.expandedView.isOpen
        ) {
          store.dispatch(
            openExpandedView(state.ui.selection.selectedOutcomes[0])
          )
        }
        break
      case 'Shift':
        store.dispatch(setShiftKeyDown())
        break
      case 'Escape':
        // closeExpandedView
        store.dispatch(closeExpandedView())
        store.dispatch(closeOutcomeForm())
        store.dispatch(unselectAll())
        store.dispatch(resetConnectionConnector())
        break
      case 'Backspace':
        // deletes one outcome for now FIXME: should be able to delete many outcomes
        let selection = state.ui.selection
        // only dispatch if something's selected and the createOutcome window is
        // not open
        if (
          selection.selectedConnections.length > 0 &&
          !state.ui.outcomeForm.isOpen &&
          !state.ui.expandedView.isOpen
        ) {
          let firstOfSelection = selection.selectedConnections[0]
          await projectsZomeApi.connection.delete(cellId, firstOfSelection)
          store.dispatch(deleteConnection(activeProject, firstOfSelection))
          // this action will trigger a recalc
          // and layout animation update, which is natural in this context.
          // we have to trigger it manually because there is a scenario where
          // deleteConnection should NOT trigger a layout recalc
          store.dispatch(triggerUpdateLayout())
          // if on firefox, and matched this case
          // prevent the browser from navigating back to the last page
          event.preventDefault()
        } else if (
          selection.selectedOutcomes.length > 0 &&
          !state.ui.outcomeForm.isOpen &&
          !state.ui.expandedView.isOpen
        ) {
          let firstOfSelection = selection.selectedOutcomes[0]
          const fullyDeletedOutcome = await projectsZomeApi.outcome.deleteOutcomeFully(
            cellId,
            firstOfSelection
          )
          store.dispatch(deleteOutcomeFully(activeProject, fullyDeletedOutcome))
          // if on firefox, and matched this case
          // prevent the browser from navigating back to the last page
          event.preventDefault()
        }
        break
      case 'Control':
        store.dispatch(setCtrlKeyDown())
        break
      case 'c':
        if (state.ui.keyboard.ctrlKeyDown) {
          if (state.ui.selection.selectedOutcomes.length) {
            // use first
            store.dispatch(setOutcomeClone(state.ui.selection.selectedOutcomes))
          }
        }
        break
      case 'v':
        if (state.ui.keyboard.ctrlKeyDown) {
          if (state.ui.outcomeClone.outcomes.length) {
            cloneOutcomes(store)
          }
        }
        break
      default:
        // console.log(event)
        break
    }
    // console.log(event)
  }

  function bodyKeyup(event) {
    // there are event.code and event.key ...
    // event.key is keyboard layout independent, so works for Dvorak users
    switch (event.key) {
      case 'g':
        store.dispatch(unsetGKeyDown())
        break
      case 'Shift':
        store.dispatch(unsetShiftKeyDown())
        break
      case 'Control':
        store.dispatch(unsetCtrlKeyDown())
        break
      default:
        // console.log(event)
        break
    }
  }

  function canvasMousemove(event) {
    const state = store.getState()
    let outcomeActionHashesToSelect
    const {
      ui: {
        viewport: { translate, scale },
        mouse: {
          coordinate: { x: initialSelectX, y: initialSelectY },
          outcomesAddresses,
        },
        screensize: { width },
      },
    } = state
    const outcomeCoordinates = state.ui.layout
    const convertedCurrentMouse = coordsPageToCanvas(
      {
        x: event.clientX,
        y: event.clientY,
      },
      translate,
      scale
    )
    store.dispatch(setLiveCoordinate(convertedCurrentMouse))

    // this only is true if the CANVAS was clicked
    // meaning it is not true if e.g. an ConnectionConnector html element
    // was clicked
    if (state.ui.mouse.mousedown) {
      if (event.shiftKey) {
        if (!outcomesAddresses) {
          store.dispatch(setCoordinate(convertedCurrentMouse))
        }
        store.dispatch(
          setSize({
            w: convertedCurrentMouse.x - initialSelectX,
            h: convertedCurrentMouse.y - initialSelectY,
          })
        )
        outcomeActionHashesToSelect = checkForOutcomeAtCoordinatesInBox(
          outcomeCoordinates,
          convertedCurrentMouse,
          { x: initialSelectX, y: initialSelectY }
        )
        store.dispatch(setOutcomes(outcomeActionHashesToSelect))
      } else {
        store.dispatch(changeTranslate(event.movementX, event.movementY))
      }
      return
    }

    const outcomeActionHash = checkForOutcomeAtCoordinates(
      ctx,
      translate,
      scale,
      outcomeCoordinates,
      state,
      event.clientX,
      event.clientY,
      outcomes
    )
    const connectionAddress = checkForConnectionAtCoordinates(
      ctx,
      translate,
      scale,
      outcomeCoordinates,
      state,
      event.clientX,
      event.clientY,
      outcomes
    )
    if (
      connectionAddress &&
      state.ui.hover.hoveredOutcome !== connectionAddress
    ) {
      store.dispatch(hoverConnection(connectionAddress))
    } else if (!outcomeActionHash && state.ui.hover.hoveredConnection) {
      store.dispatch(unhoverConnection())
    }

    if (
      outcomeActionHash &&
      state.ui.hover.hoveredOutcome !== outcomeActionHash
    ) {
      store.dispatch(hoverOutcome(outcomeActionHash))
      // hook up if the connection connector to a new Outcome
      // if we are using the connection connector
      // and IMPORTANTLY if Outcome is in the list of `validToAddresses`
      if (
        state.ui.connectionConnector.fromAddress &&
        state.ui.connectionConnector.validToAddresses.includes(
          outcomeActionHash
        )
      ) {
        store.dispatch(setConnectionConnectorTo(outcomeActionHash))
      }
    } else if (!outcomeActionHash && state.ui.hover.hoveredOutcome) {
      store.dispatch(unhoverOutcome())
      store.dispatch(setConnectionConnectorTo(null))
    }
  }

  // don't allow this function to be called more than every 200 milliseconds
  const debouncedWheelHandler = _.debounce(
    (event) => {
      const state = store.getState()
      const {
        ui: {
          localPreferences: { navigation },
        },
      } = state
      if (!state.ui.outcomeForm.isOpen) {
        // from https://medium.com/@auchenberg/detecting-multi-touch-trackpad-gestures-in-javascript-a2505babb10e
        // and https://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate
        if (
          navigation === MOUSE ||
          (navigation === TRACKPAD && event.ctrlKey)
        ) {
          // Normalize wheel to +1 or -1.
          const wheel = event.deltaY < 0 ? 1 : -1
          const zoomIntensity = 0.05
          // Compute zoom factor.
          const zoom = Math.exp(wheel * zoomIntensity)
          const mouseX = event.clientX
          const mouseY = event.clientY
          store.dispatch(changeScale(zoom, mouseX, mouseY))
        } else {
          // invert the pattern so that it uses new mac style
          // of panning
          store.dispatch(changeTranslate(-1 * event.deltaX, -1 * event.deltaY))
        }
      }
    },
    2,
    { leading: true }
  )

  function canvasWheel(event) {
    debouncedWheelHandler(event)
    event.preventDefault()
  }

  function canvasClick(event) {
    const state: RootState = store.getState()
    // outcomesAddresses are Outcomes to be selected
    const {
      ui: {
        mouse: { outcomesAddresses },
      },
    } = state

    if (state.ui.keyboard.gKeyDown) {
      // opening the OutcomeForm is dependent on
      // holding down the `g` keyboard key modifier
      handleMouseUpForOutcomeForm({ state, event, store })
    } else if (outcomesAddresses) {
      // finishing a drag box selection action
      outcomesAddresses.forEach((value) => store.dispatch(selectOutcome(value)))
    } else {
      // check for node in clicked area
      // select it if so
      const {
        ui: {
          viewport: { translate, scale },
        },
      } = state
      const outcomeCoordinates = state.ui.layout

      const clickedConnectionAddress = checkForConnectionAtCoordinates(
        ctx,
        translate,
        scale,
        outcomeCoordinates,
        state,
        event.clientX,
        event.clientY,
        outcomes
      )
      const clickedOutcomeAddress = checkForOutcomeAtCoordinates(
        ctx,
        translate,
        scale,
        outcomeCoordinates,
        state,
        event.clientX,
        event.clientY,
        outcomes
      )
      if (clickedConnectionAddress) {
        store.dispatch(unselectAll())
        store.dispatch(selectConnection(clickedConnectionAddress))
      } else if (clickedOutcomeAddress) {
        // if the shift key is being use, do an 'additive' select
        // where you add the Outcome to the list of selected
        if (!event.shiftKey) {
          store.dispatch(unselectAll())
        }
        // if using shift, and Outcome is already selected, unselect it
        if (
          event.shiftKey &&
          state.ui.selection.selectedOutcomes.indexOf(clickedOutcomeAddress) >
          -1
        ) {
          store.dispatch(unselectOutcome(clickedOutcomeAddress))
        } else {
          store.dispatch(selectOutcome(clickedOutcomeAddress))
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
    store.dispatch(unsetSize())
  }

  function canvasMousedown(event) {
    store.dispatch(setMousedown())
  }

  function canvasMouseup(event) {
    const state = store.getState()
    // ASSUMPTION: one parent (existingParentConnectionAddress)
    const {
      fromAddress,
      relation,
      toAddress,
      existingParentConnectionAddress,
    } = state.ui.connectionConnector
    const { activeProject } = state.ui
    if (fromAddress) {
      // covers the case where we are hovered over an Outcome
      // and thus making a connection to an existing Outcome
      // AS WELL AS the case where we are not
      // (to reset the connection connector)
      handleConnectionConnectMouseUp(
        fromAddress,
        relation,
        toAddress,
        // ASSUMPTION: one parent
        existingParentConnectionAddress,
        activeProject,
        store.dispatch
      )
      // covers the case where we are not hovered over an Outcome
      // and thus making a new Outcome and connection/Connection
      if (!toAddress) {
        handleMouseUpForOutcomeForm({
          state,
          event,
          store,
          fromAddress,
          relation,
          existingParentConnectionAddress,
        })
      }
    }

    // update the mouse aware state
    store.dispatch(unsetMousedown())
  }

  function canvasDoubleclick(event) {
    const state = store.getState()
    const {
      ui: {
        activeProject,
        viewport: { translate, scale },
      },
    } = state
    const outcomes = state.projects.outcomes[activeProject] || {}
    const outcomeCoordinates = state.ui.layout
    const outcomeActionHash = checkForOutcomeAtCoordinates(
      ctx,
      translate,
      scale,
      outcomeCoordinates,
      state,
      event.clientX,
      event.clientY,
      outcomes
    )
    const calcedPoint = coordsPageToCanvas(
      {
        x: event.clientX,
        y: event.clientY,
      },
      translate,
      scale
    )
    if (outcomeActionHash) {
      store.dispatch(openExpandedView(outcomeActionHash))
    } else {
      store.dispatch(openOutcomeForm(calcedPoint.x, calcedPoint.y))
    }
  }

  window.addEventListener('resize', windowResize)
  document.body.addEventListener('keydown', bodyKeydown)
  document.body.addEventListener('keyup', bodyKeyup)
  // TODO: debounce/throttle this so that it doesn't fire crazy frequently and
  // kill performance
  canvas.addEventListener('mousemove', canvasMousemove)
  canvas.addEventListener('wheel', canvasWheel)
  canvas.addEventListener('mousedown', canvasMousedown)
  canvas.addEventListener('mouseup', canvasMouseup)
  canvas.addEventListener('dblclick', canvasDoubleclick)
  // This listener is bound to the canvas only so clicks on other parts of
  // the UI like the OutcomeForm won't trigger it.
  canvas.addEventListener('click', canvasClick)

  return function cleanup() {
    window.removeEventListener('resize', windowResize)
    document.body.removeEventListener('keydown', bodyKeydown)
    document.body.removeEventListener('keyup', bodyKeyup)
    // TODO: debounce/throttle this so that it doesn't fire crazy frequently and
    // kill performance
    canvas.removeEventListener('mousemove', canvasMousemove)
    canvas.removeEventListener('wheel', canvasWheel)
    canvas.removeEventListener('mousedown', canvasMousedown)
    canvas.removeEventListener('mouseup', canvasMouseup)
    canvas.removeEventListener('dblclick', canvasDoubleclick)
    // This listener is bound to the canvas only so clicks on other parts of
    // the UI like the OutcomeForm won't trigger it.
    canvas.removeEventListener('click', canvasClick)
  }
}
