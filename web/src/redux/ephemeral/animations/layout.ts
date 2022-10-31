import TWEEN from '@tweenjs/tween.js'
import { CREATE_OUTCOME_WITH_CONNECTION } from '../../persistent/projects/outcomes/actions'
import { updateLayout } from '../layout/actions'
import layoutFormula, { Layout } from '../../../drawing/layoutFormula'
import { RootState } from '../../reducer'
import { LAYOUT_ANIMATION_DURATION_MS } from '../../../constants'
import { ComputedOutcome } from '../../../types'
import { getTreesForState } from './get-trees-for-state'

// By default, this function performs an animated transition asynchronously
// between the old state and the new state, in terms of layout.
// However, if you pass `instant: true` it will perform it synchronously and
// instantly without transition
export default function performLayoutAnimation(
  store: any,
  action: {
    type: string
    payload?: { outcome?: ComputedOutcome; instant?: boolean }
  },
  currentState: RootState
) {
  // called nextState because by now the
  // initial action has been integrated
  const nextState: RootState = store.getState()
  const computedOutcomeTrees = getTreesForState(nextState)
  const zoomLevel = nextState.ui.viewport.scale
  const projectId = nextState.ui.activeProject
  const projectTags = Object.values(nextState.projects.tags[projectId] || {})
  // this is our final destination layout
  // that we'll be animating to
  const newLayout = layoutFormula(computedOutcomeTrees, zoomLevel, projectTags)

  // just instantly update to the new layout without
  // animating / transitioning between the current one and the new one
  // if instructed to
  if (typeof action.payload === 'object' && action.payload.instant) {
    store.dispatch(updateLayout(newLayout))
    return
  }

  // not instant, so continue and run an animated transition

  // if creating an Outcome, we also want to animate
  // from the position wherever the user was creating it
  // to its new resting place in the new layout
  let outcomeCreatedCoord: Layout = {}
  if (action.type === CREATE_OUTCOME_WITH_CONNECTION) {
    // at this point we have the actionHash of the new Outcome
    // and we also have the coordinates where the "Outcome Form"
    // was open and being used
    outcomeCreatedCoord[action.payload.outcome.actionHash] = {
      x: currentState.ui.outcomeForm.leftConnectionXPosition,
      y: currentState.ui.outcomeForm.topConnectionYPosition,
    }
  }

  // this is expanding coordinates for Outcomes
  // where the key is their actionHash
  // and the value is an object with `x` and `y` values
  // (tween is going to directly modify this object)
  const currentLayoutTween = {
    // do this to add any new ones
    // that will just start out in their final position
    ...newLayout,
    // do this to override the coordinates of the newly
    // created Outcome when handling a create action
    // and make its original position equal to the position
    // of the Outcome Form when it was open
    ...outcomeCreatedCoord,
  }
  // we do NOT want to keep original layouts for Outcomes
  // that are no longer in the project, so those are automatically
  // ignored during this loop
  for (const outcome in newLayout) {
    // do this to override any new ones with existing ones
    // to begin with
    if (currentState.ui.layout[outcome]) {
      currentLayoutTween[outcome] = {
        ...currentState.ui.layout[outcome],
      }
    }
  }
  // transition currentLayoutTween object
  // into newLayout object
  new TWEEN.Tween(currentLayoutTween)
    .to(newLayout)
    // use this easing, adjust me to tune, see TWEEN.Easing for options
    .easing(TWEEN.Easing.Quadratic.InOut)
    .duration(LAYOUT_ANIMATION_DURATION_MS)
    .start()
    // updatedLayout is the transitionary state between currentLayoutTween and newLayout
    .onUpdate((updatedLayout) => {
      // dispatch an update to the layout
      // which will trigger a repaint on the canvas
      // every time the animation loop fires an update
      store.dispatch(
        updateLayout({
          ...updatedLayout,
        })
      )
    })
}
