import TWEEN from '@tweenjs/tween.js'
import {
    CREATE_OUTCOME_WITH_CONNECTION,
    FETCH_OUTCOMES,
    DELETE_OUTCOME_FULLY
} from '../../persistent/projects/outcomes/actions'
import {
    AFFECT_LAYOUT_DELETE_CONNECTION,
    PREVIEW_CONNECTIONS,
    CLEAR_CONNECTIONS_PREVIEW,
    CREATE_CONNECTION,
    FETCH_CONNECTIONS,
} from '../../persistent/projects/connections/actions'
import {
  TRIGGER_UPDATE_LAYOUT,
} from './actions'
import panZoomToFrame from '../animations/pan-and-zoom'
import { ANIMATE_PAN_AND_ZOOM } from '../viewport/actions'
import performLayoutAnimation from '../animations/layout'


const isOneOfLayoutAffectingActions = (action) => {
    const { type } = action
    // DELETE_EDGE should be here
    // except that there is an instance where we
    // quickly in succession delete an edge and then
    // create a new one, so we have to manually instruct
    // in that case (via a separate TRIGGER_UPDATE_LAYOUT action)
    // whether or not to perform the layout update
    return type === TRIGGER_UPDATE_LAYOUT
        || type === PREVIEW_CONNECTIONS
        || type === CLEAR_CONNECTIONS_PREVIEW
        || type === CREATE_OUTCOME_WITH_CONNECTION
        || type === FETCH_OUTCOMES
        || type === DELETE_OUTCOME_FULLY
        || type === CREATE_CONNECTION
        || type === FETCH_CONNECTIONS
}

const isOneOfViewportAffectingActions = (action) => {
  const { type } = action
  return type === ANIMATE_PAN_AND_ZOOM
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
      // (anything that deletes or adds Outcomes or Connections which form the graph we
      // pass to dagre to generate a layout) that this kicks in, and handles the creation of an animation
      // from the current layout to the new layout, by using the TWEENJS library

      let currentState
      const shouldReLayout = isOneOfLayoutAffectingActions(action)
      const shouldAnimateViewport = isOneOfViewportAffectingActions(action)
      // don't call and getState if we don't have to
      if (shouldReLayout || shouldAnimateViewport) {
        currentState = store.getState()
      }
      // perform the usual (next) action ->
      // first integrate the new data
      // that way the layout recalculation
      // will include it
      let result = next(action)

      // in the case of a special "layout affecting"
      // action, we should also recalculate the layout
      // based on the new graph of Outcomes and Connections
      // and animate to it
      if (shouldReLayout) {
        performLayoutAnimation(store, action, currentState)
      } else if (shouldAnimateViewport) {
        panZoomToFrame(store, action, currentState)
      }

      return result
  }
}


export {
    layoutWatcher
}