import TWEEN from '@tweenjs/tween.js'
import { outcomeHeight, outcomeWidth } from '../../../drawing/dimensions'
import { changeAllDirect } from '../viewport/actions'

export default function panZoomToFrame(store, action, currentState) {
  const currentLayoutTween = {
    ...currentState.ui.viewport
  }

  const outcomeActionHash = action.payload
  const outcomeCoordinates = currentState.ui.layout[outcomeActionHash]
  
  if (!outcomeCoordinates) {
    console.log('could not find coordinates for outcome to animate to')
    return
  }
  const {width, height } = currentState.ui.screensize
  const dpr = window.devicePixelRatio || 1
  const halfScreenWidth = width / (2 * dpr)
  const halfScreenHeight = height / (2 * dpr)
  // Destination viewport
  // is to center the outcome
  // and to be at zoom level "1" a.k.a no zoom
  const newLayout = {
    scale: 1,
    translate: {
      x: -1 * outcomeCoordinates.x + halfScreenWidth - outcomeWidth / 2,
      y: -1 * outcomeCoordinates.y + halfScreenHeight - outcomeHeight / 2
    }
  }

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