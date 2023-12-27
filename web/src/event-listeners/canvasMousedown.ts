import { coordsPageToCanvas } from "../drawing/coordinateSystems"
import { setMousedown, unsetContextMenu, setCoordinate } from "../redux/ephemeral/mouse/actions"
import { RootState } from "../redux/reducer"


export default function canvasMousedown(store: any, event: MouseEvent) {
    const state: RootState = store.getState()
    const {
      ui: {
        viewport: { translate, scale },
      },
    } = state
    // don't set mouseDown if it's a right click
    const RIGHT_CLICK_BUTTON = 2
    if (event.button !== RIGHT_CLICK_BUTTON) {
      store.dispatch(setMousedown())
      store.dispatch(unsetContextMenu())
      const convertedCurrentMouse = coordsPageToCanvas(
        {
          x: event.clientX,
          y: event.clientY,
        },
        translate,
        scale
      )
      store.dispatch(setCoordinate(convertedCurrentMouse))
    }
  }