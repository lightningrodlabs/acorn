import {
  OPEN_EXPANDED_VIEW,
  CLOSE_EXPANDED_VIEW,
} from '../expanded-view/actions'
import {
  START_TITLE_EDIT,
  END_TITLE_EDIT,
  START_DESCRIPTION_EDIT,
  END_DESCRIPTION_EDIT,
} from '../goal-editing/actions'
import { sendRealtimeInfoSignal } from './actions'



// capture open/close expanded view, start/end title/description edit, and enter/exit project actions
// import action constants
// isOneOfRealtimeInfoAffectingActions checks action type against
// can first start with just open close expanded view, then change the title/description edits action logic (and state) then implement in middleware

const isOneOfRealtimeInfoAffectingActions = (action) => {
  const { type } = action
  return type === OPEN_EXPANDED_VIEW
      || type === CLOSE_EXPANDED_VIEW
      || type === START_TITLE_EDIT
      || type === END_TITLE_EDIT
      || type === START_DESCRIPTION_EDIT
      || type === END_DESCRIPTION_EDIT
}
// watch for actions that will affect the realtime info state values

const realtimeInfoWatcher = store => {


  // return the action handler middleware
  return next => async action => {

    const shouldSendRealtimeSignal = isOneOfRealtimeInfoAffectingActions(action)
    if (shouldSendRealtimeSignal) {
      console.log('logging middleware:', action.payload) 
      let result = next(action)
      let state = store.getState()
      store.dispatch(sendRealtimeInfoSignal.create(getRealtimeInfo(state)))
      return result
    }
    // return result
    let result = next(action)
    return result
  }
}
// cherry-pick the relevant state for sending as a RealtimeInfo Signal
// eventually, this function would also be used when sending real time info at set interval
function getRealtimeInfo(state) {
  let cellIdString = state.ui.activeProject
  let goalBeingEdited
  if ("goalAddress" in state.ui.goalEditing && "isTitle" in state.ui.goalEditing) {
    goalBeingEdited = {
      goal_address: state.ui.goalEditing.goalAddress,
      is_title: state.ui.goalEditing.isTitle,
    }
  }
  else {
    goalBeingEdited = null
  }
  let payload = {
    project_id: state.ui.activeProject,
    goal_being_edited: goalBeingEdited,
    goal_expanded_view: state.ui.expandedView.goalAddress
  }
  return { cellIdString, payload }
}
export {
    realtimeInfoWatcher
}