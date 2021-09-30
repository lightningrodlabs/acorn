import TWEEN from '@tweenjs/tween.js'
import {
    createGoalWithEdge,
    fetchGoals,
    archiveGoalFully
} from '../projects/goals/actions'
import {
    createEdge,
    fetchEdges,
    AFFECT_LAYOUT_ARCHIVE_EDGE,
    PREVIEW_EDGES,
    CLEAR_EDGES_PREVIEW,
} from '../projects/edges/actions'
import {
  TRIGGER_UPDATE_LAYOUT,
  updateLayout
} from '../layout/actions'
import layoutFormula from '../drawing/layoutFormula'

const isOneOfLayoutAffectingActions = (action) => {
    const { type } = action
    return type === TRIGGER_UPDATE_LAYOUT
        || type === PREVIEW_EDGES
        || type === CLEAR_EDGES_PREVIEW
        || type === createGoalWithEdge.success().type
        || type === fetchGoals.success().type
        || type === archiveGoalFully.success().type
        || type === createEdge.success().type
        || type === fetchEdges.success().type
        || (action.type === AFFECT_LAYOUT_ARCHIVE_EDGE && action.affectLayout)
}

// watch for actions that will affect the layout (create/fetches/deletes)
// and update the layout when we see an action like that
// it is useful to have this layout cached in the state for performance reasons

const layoutWatcher = store => {

  // when this middleware is called
  // run an animation loop which will performantly handle 
  // the animation of layouts
  animate()
  function animate() {
    requestAnimationFrame(animate)
    TWEEN.update()
  }

  // return the action handler middleware
  return next => async action => {

      // in many cases, we just skip right over this middleware, 
      // and it has no effect. it is only during 'layout affecting actions'
      // (anything that deletes or adds Goals or Edges which form the graph we
      // pass to dagre to generate a layout) that this kicks in, and handles the creation of an animation
      // from the current layout to the new layout, by using the TWEENJS library

      // catch and handle this uniquely special action
      // which has a special case of being a delete firing very close in time to
      // a create action (since we delete an Edge then immediately create one)
      // and allow preventing that action in special cases from causing a layout animation
      // to occur
      const specialLayoutAffectingArchiveEdge = action.type === AFFECT_LAYOUT_ARCHIVE_EDGE
      if (specialLayoutAffectingArchiveEdge) {
        if (!action.affectLayout) {
          // just dispatch the "real" action and return that
          return store.dispatch(action.asyncAction)
        } else {
          // wait for the async action to complete before running re-layout
          await store.dispatch(action.asyncAction)
          // now the store will have the edge removed from state
          // meaning the end calculated layout will be proper
        }
      }

      let currentState
      const shouldReLayout = isOneOfLayoutAffectingActions(action)
      // don't call and getState if we don't have to
      if (shouldReLayout) {
        currentState = store.getState()
      }
      // perform the usual (next) action ->
      // first integrate the new data
      // that way the layout recalculation
      // will include it
      let result = next(action)

      // in the case of a special "layout affecting"
      // action, we should also recalculate the layout
      // based on the new graph of Goals and Edges
      // and animate to it
      if (shouldReLayout) {
        performAnimation(store, action, currentState)
      }

      return result
  }
}

function performAnimation(store, action, currentState) {
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


export {
    layoutWatcher
}