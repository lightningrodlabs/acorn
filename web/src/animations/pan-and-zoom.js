import TWEEN from '@tweenjs/tween.js'
import { goalHeight, goalWidth } from '../drawing/dimensions'
import { changeAllDirect } from '../viewport/actions'

export default function panZoomToFrame(store, action, currentState) {
  // const currentLayoutTween = {
  //   // do this to add any new ones
  //   // that will just start out in their final position
  //   ...newLayout,
  //   // do this to override the coordinates of the newly 
  //   // created Goal when handling a create action
  //   // and make its original position equal to the position
  //   // of the Goal Form when it was open
  //   ...goalCreatedCoord,
  //   // do this to override any new ones with existing ones
  //   // to begin with
  //   ...currentState.ui.layout,
  // }
  const currentLayoutTween = {
    ...currentState.ui.viewport
  }

  const goalHeaderHash = action.payload
  const goalCoordinates = currentState.ui.layout[goalHeaderHash]
  
  if (!goalCoordinates) {
    console.log('could not find coordinates for goal to animate to')
    return
  }
  const {width, height } = currentState.ui.screensize
  const dpr = window.devicePixelRatio || 1
  const newLayout = {
    scale: 1,
    translate: {
      x: -1 * goalCoordinates.x + width / (2 * dpr) - goalWidth / 2,
      y: -1 * goalCoordinates.y + height / (2 * dpr) - goalHeight / 2
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