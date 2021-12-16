import TWEEN from '@tweenjs/tween.js'
import {
    createGoalWithEdge,
} from '../projects/goals/actions'
import {
  updateLayout
} from '../layout/actions'
import layoutFormula from '../drawing/layoutFormula'

export default function performLayoutAnimation(store, action, currentState) {
  // called nextState because by now the
  // initial action has been integrated
  const nextState = store.getState()
  const projectId = nextState.ui.activeProject
  const graphData = {
      goals: nextState.projects.goals[projectId] || {},
      edges: nextState.projects.edges[projectId] || {},
  }
  // this is our final destination layout
  // that we'll be animating to
  const newLayout = layoutFormula(graphData)
  let goalCreatedCoord = {}
  // if creating a Goal, we also want to animate
  // from the position wherever the user was creating it
  // to its new resting place in the new layout
  if (action.type === createGoalWithEdge.success().type) {
    // at this point we have the headerHash of the new Goal
    // and we also have the coordinates where the "Goal Form"
    // was open and being used
    goalCreatedCoord[action.payload.goal.headerHash] = {
      x: currentState.ui.goalForm.leftEdgeXPosition,
      y: currentState.ui.goalForm.topEdgeYPosition,
    }
  }
  
  // this is expanding coordinates for Goals
  // where the key is their headerHash
  // and the value is an object with `x` and `y` values
  // (tween is going to directly modify this object)
  const currentLayoutTween = {
    // do this to add any new ones
    // that will just start out in their final position
    ...newLayout,
    // do this to override the coordinates of the newly 
    // created Goal when handling a create action
    // and make its original position equal to the position
    // of the Goal Form when it was open
    ...goalCreatedCoord,
    // do this to override any new ones with existing ones
    // to begin with
    ...currentState.ui.layout,
  }
  // transition currentLayoutTween object
  // into newLayout object
  new TWEEN.Tween(currentLayoutTween)
    .to(newLayout)
    // use this easing, adjust me to tune, see TWEEN.Easing for options
    .easing(TWEEN.Easing.Quadratic.InOut)
    .duration(60) // last 60 milliseconds, adjust me to tune
    .start()
    // updatedLayout is the transitionary state between currentLayoutTween and newLayout
    .onUpdate((updatedLayout) => {
      // dispatch an update to the layout
      // which will trigger a repaint on the canvas
      // every time the animation loop fires an update
      store.dispatch(updateLayout(updatedLayout))
    })
}