import {
  OPEN_EXPANDED_VIEW,
  CLOSE_EXPANDED_VIEW,
} from '../../../ephemeral/expanded-view/actions'
import {
  START_TITLE_EDIT,
  END_TITLE_EDIT,
  START_DESCRIPTION_EDIT,
  END_DESCRIPTION_EDIT,
} from '../../../ephemeral/goal-editing/actions'
import {
  SEND_REALTIME_INFO,
  SEND_EXIT_PROJECT_SIGNAL,
  sendRealtimeInfoSignal
} from './actions'
import ProjectsZomeApi from '../../../../api/projectsApi'
import { getAppWs } from '../../../../hcWebsockets'
import { cellIdFromString } from '../../../../utils'

const isOneOfRealtimeInfoAffectingActions = (action) => {
  const { type } = action
  return (
    type === OPEN_EXPANDED_VIEW ||
    type === CLOSE_EXPANDED_VIEW ||
    type === START_TITLE_EDIT ||
    type === END_TITLE_EDIT ||
    type === START_DESCRIPTION_EDIT ||
    type === END_DESCRIPTION_EDIT ||
    type === SEND_REALTIME_INFO
  )
}

const isProjectExitAction = (action) => {
  const { type } = action
  return type === SEND_EXIT_PROJECT_SIGNAL
}
// watch for actions that will affect the realtime info state values

const realtimeInfoWatcher = (store) => {
  // return the action handler middleware
  return (next) => async (action) => {
    const shouldSendRealtimeSignal = isOneOfRealtimeInfoAffectingActions(action)
    const appWebsocket = await getAppWs()
    const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
    if (shouldSendRealtimeSignal) {
      let result = next(action)
      let state = store.getState()
      const { cellIdString, payload } = getRealtimeInfo(state)
      const cellId = cellIdFromString(cellIdString)
      await projectsZomeApi.realtimeInfoSignal.send(cellId, payload)
      store.dispatch(sendRealtimeInfoSignal(getRealtimeInfo(state)))
      return result
    }
    const shouldSendProjectExitSignal = isProjectExitAction(action)
    if (shouldSendProjectExitSignal) {
      let state = store.getState()
      const cellIdString = state.ui.activeProject
      const payload = {
        projectId: '',
        goalBeingEdited: null,
        goalExpandedView: null,
      }
      const cellId = cellIdFromString(cellIdString)
      await projectsZomeApi.realtimeInfoSignal.send(cellId, payload)
      store.dispatch(sendRealtimeInfoSignal(cellIdString, payload))
      // does this action even need to be sent? there is no reducer/state change from it
    }

    // return result
    let result = next(action)
    return result
  }
}
// cherry-pick the relevant state for sending as a RealtimeInfo Signal
function getRealtimeInfo(state) {
  let cellIdString = state.ui.activeProject
  let payload = {
    projectId: state.ui.activeProject,
    goalBeingEdited: state.ui.goalEditing,
    goalExpandedView: state.ui.expandedView.goalAddress,
  }
  return { cellIdString, payload }
}
export { realtimeInfoWatcher }
