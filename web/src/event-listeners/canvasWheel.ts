import { unhoverOutcome } from "../redux/ephemeral/hover/actions"
import { MOUSE, TRACKPAD } from "../redux/ephemeral/local-preferences/reducer"
import { unsetContextMenu } from "../redux/ephemeral/mouse/actions"
import { changeScale, changeTranslate } from "../redux/ephemeral/viewport/actions"


export default function canvasWheel(store: any, event: WheelEvent) {
    const state = store.getState()
    const {
      ui: {
        localPreferences: { navigation },
      },
    } = state
    if (!state.ui.outcomeForm.isOpen) {
      store.dispatch(unhoverOutcome())
      store.dispatch(unsetContextMenu())
      // from https://medium.com/@auchenberg/detecting-multi-touch-trackpad-gestures-in-javascript-a2505babb10e
      // and https://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate
      if (navigation === MOUSE || (navigation === TRACKPAD && event.ctrlKey)) {
        // Normalize wheel to +1 or -1.
        const wheel = event.deltaY < 0 ? 1 : -1
        const zoomIntensity = 0.07 // 0.05
        // Compute zoom factor.
        const zoom = Math.exp(wheel * zoomIntensity)
        const pageCoord = { x: event.clientX, y: event.clientY }
        const instant = true
        store.dispatch(changeScale(zoom, pageCoord, instant))
      } else {
        // invert the pattern so that it uses new mac style
        // of panning
        store.dispatch(changeTranslate(-1 * event.deltaX, -1 * event.deltaY))
      }
    }
    event.preventDefault()
  }