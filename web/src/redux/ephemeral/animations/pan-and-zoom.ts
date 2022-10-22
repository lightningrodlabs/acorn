import TWEEN from '@tweenjs/tween.js'
import { outcomeHeight, outcomeWidth } from '../../../drawing/dimensions'
import { ActionHashB64 } from '../../../types/shared'
import { RootState } from '../../reducer'
import { changeAllDirect } from '../viewport/actions'

export default function panZoomToFrame(
  store: any,
  action: {
    payload: { outcomeActionHash: ActionHashB64; adjustScale: boolean }
  },
  currentState: RootState
) {
  const currentLayoutTween = {
    ...currentState.ui.viewport,
  }

  const { outcomeActionHash, adjustScale } = action.payload
  const outcomeCoordinates = currentState.ui.layout[outcomeActionHash]

  if (!outcomeCoordinates) {
    console.log('could not find coordinates for outcome to animate to')
    return
  }
  const { width, height } = currentState.ui.screensize
  const dpr = window.devicePixelRatio || 1
  const halfScreenWidth = width / (2 * dpr)
  const halfScreenHeight = height / (2 * dpr)

  // Destination viewport
  // is to center the outcome
  // we can also adjust the scale back to 1, or not,
  // depending on the 'action.adjustScale' value
  const scale = adjustScale ? 1 : currentState.ui.viewport.scale
  const newLayout = {
    scale,
    translate: {
      x: -1 * (outcomeCoordinates.x * scale) + (halfScreenWidth) - (outcomeWidth / 2) * scale,
      y: -1 * (outcomeCoordinates.y * scale) + (halfScreenHeight) - (outcomeHeight / 2) * scale,
    },
  }
  // console.log(newLayout)
  // @ts-ignore
  // window.update = function(payload) {
  //   store.dispatch(changeAllDirect(payload))
  // }

  new TWEEN.Tween(currentLayoutTween)
    .to(newLayout)
    // use this easing, adjust me to tune, see TWEEN.Easing for options
    .easing(TWEEN.Easing.Quadratic.InOut)
    .duration(1000) // last 1000 milliseconds, adjust me to tune
    .start()
    // updatedLayout is the transitionary state between currentLayoutTween and newLayout
    .onUpdate((updated) => {
      // dispatch an update to the layout
      // which will trigger a repaint on the canvas
      // every time the animation loop fires an update
      store.dispatch(changeAllDirect(updated))
    })
}
