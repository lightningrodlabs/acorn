import TWEEN from '@tweenjs/tween.js'
import { getOutcomeHeight, getOutcomeWidth } from '../../../drawing/dimensions'
import layoutFormula from '../../../drawing/layoutFormula'
import { ActionHashB64 } from '../../../types/shared'
import { RootState } from '../../reducer'
import { updateLayout } from '../layout/actions'
import { selectOutcome, unselectAll } from '../selection/actions'
import { changeAllDirect } from '../viewport/actions'
import { getTreesForState } from './get-trees-for-state'


/*
  In this function as we animate the "pan and zoom", or "translate and scale"
  **we take responsibility** not only for those values, but for the Outcome layout
  which would typically change according to a changing zoomLevel as well
*/
export default function panZoomToFrame(
  store: any,
  action: {
    payload: {
      outcomeActionHash: ActionHashB64
      adjustScale: boolean
      instant?: boolean
    }
  }
) {
  let { outcomeActionHash, adjustScale } = action.payload

  const state: RootState = store.getState()

  // Destination viewport
  // is to center the outcome
  // we can also adjust the scale back to a default value, or not,
  // depending on the 'action.adjustScale' value
  // 0.7 is a good choice here because the text should be visible
  const defaultScaleForPanAndZoom = 0.7
  const zoomLevel = adjustScale
    ? defaultScaleForPanAndZoom
    : state.ui.viewport.scale

  const { activeProject } = state.ui
  const outcomeTrees = getTreesForState(state)

  const projectTags = Object.values(state.projects.tags[activeProject] || {})

  const collapsedOutcomes =
    state.ui.collapsedOutcomes.collapsedOutcomes[activeProject] || {}
  // this is our final destination layout
  // that we'll be animating to
  // use the target zoomLevel
  const newLayout = layoutFormula(
    outcomeTrees,
    zoomLevel,
    projectTags,
    collapsedOutcomes
  )

  // this accounts for a special case where the caller doesn't
  // provide the intended Outcome ActionHash, but instead expects this
  // function to pick the best one
  if (!outcomeActionHash) {
    // pick the first parent to center on
    outcomeActionHash = (outcomeTrees.computedOutcomesAsTree[0] || {})
      .actionHash
  }

  const outcome = outcomeTrees.computedOutcomesKeyed[outcomeActionHash]
  // important, for the outcomeCoordinates we should
  // definitely choose them from the new intended layout,
  // not the existing one
  const outcomeCoordinates = newLayout.coordinates[outcomeActionHash]

  if (!outcomeCoordinates) {
    console.log('could not find coordinates for outcome to animate to')
    return
  }

  // since we will be transitioning the viewport, which changes the zoom
  // we should start out by updating the layout to the layout it would be
  // at the destination zoomLevel
  store.dispatch(updateLayout(newLayout))
  // we should also deselect all other Outcomes, and select the one
  // we are panning and zooming to
  store.dispatch(unselectAll())
  store.dispatch(selectOutcome(outcomeActionHash))

  const { width, height } = state.ui.screensize
  const dpr = window.devicePixelRatio || 1
  const halfScreenWidth = width / (2 * dpr)
  const halfScreenHeight = height / (2 * dpr)

  const outcomeWidth = getOutcomeWidth({
    outcome,
    zoomLevel, // use the target scale
  })
  const outcomeHeight = getOutcomeHeight({
    outcome,
    projectTags,
    zoomLevel, // use the target scale
    width: outcomeWidth,
    useLineLimit: true,
  })
  const newViewport = {
    scale: zoomLevel,
    translate: {
      x:
        -1 * (outcomeCoordinates.x * zoomLevel) +
        halfScreenWidth -
        (outcomeWidth / 2) * zoomLevel,
      y:
        -1 * (outcomeCoordinates.y * zoomLevel) +
        halfScreenHeight -
        (outcomeHeight / 2) * zoomLevel,
    },
  }

  // just instantly update to the new layout without
  // animating / transitioning between the current one and the new one
  // if instructed to
  if (typeof action.payload === 'object' && action.payload.instant) {
    store.dispatch(changeAllDirect(newViewport))
    return
  }

  // not instant, so continue and run an animated transition
  const currentViewportTween = {
    ...state.ui.viewport,
  }

  new TWEEN.Tween(currentViewportTween)
    .to(newViewport)
    // use this easing, adjust me to tune, see TWEEN.Easing for options
    .easing(TWEEN.Easing.Quadratic.InOut)
    .duration(1000) // last 1000 milliseconds, adjust me to tune
    .start()
    // updatedViewport is the transitionary state between currentViewportTween and newViewport
    .onUpdate((updated) => {
      // dispatch an update to the viewport
      // which will trigger a repaint on the canvas
      // every time the animation loop fires an update
      store.dispatch(changeAllDirect(updated))
    })
}
