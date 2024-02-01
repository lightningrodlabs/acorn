import {
  OPEN_EXPANDED_VIEW,
  CLOSE_EXPANDED_VIEW,
} from '../../../ephemeral/expanded-view/actions'
import {
  START_TITLE_EDIT,
  END_TITLE_EDIT,
  START_DESCRIPTION_EDIT,
  END_DESCRIPTION_EDIT,
} from '../../../ephemeral/outcome-editing/actions'
import { SEND_REALTIME_INFO, SEND_EXIT_PROJECT_SIGNAL } from './actions'
import ProjectsZomeApi from '../../../../api/projectsApi'
import { cellIdFromString } from '../../../../utils'
import { RootState } from '../../../reducer'
import { CellIdString } from '../../../../types/shared'
import { AppAgentClient, AppAgentWebsocket } from '@holochain/client'

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

const isProjectExitAction = (action: { type: string }) => {
  const { type } = action
  return type === SEND_EXIT_PROJECT_SIGNAL
}
// watch for actions that will affect the realtime info state values

// return the action handler middleware
const realtimeInfoWatcher =
  // closure the appWebsocket
  (appWebsocket: AppAgentClient) =>
    // provide the typical redux middleware signature
    (store: any) => (next: any) => async (action: any) => {
      if (isOneOfRealtimeInfoAffectingActions(action)) {
        const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
        let result = next(action)
        if (
          (appWebsocket as AppAgentWebsocket).appWebsocket.client.socket
            .readyState ===
          (appWebsocket as AppAgentWebsocket).appWebsocket.client.socket.OPEN
        ) {
          let state: RootState = store.getState()
          const payload = getRealtimeInfo(state)
          // there is a chance that the project has been exited
          // and thus this need not be fired
          if (payload.projectId) {
            const cellId = cellIdFromString(payload.projectId)
            projectsZomeApi.realtimeInfoSignal
              .send(cellId, payload)
              .catch((e) => {
                console.log(
                  'could not send realtime info signal due to error:',
                  e
                )
              })
          }
        }
        return result
      } else if (isProjectExitAction(action)) {
        const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
        const payload = {
          projectId: '',
          outcomeBeingEdited: null,
          outcomeExpandedView: null,
        }
        const cellIdString: CellIdString = action.payload
        const cellId = cellIdFromString(cellIdString)
        // TODO: catch and log error, but don't
        // await this call
        projectsZomeApi.realtimeInfoSignal.send(cellId, payload).catch((e) => {
          console.log('could not send realtime info signal due to error:', e)
        })
        return next(action)
      } else {
        return next(action)
      }
    }

// cherry-pick the relevant state for sending as a RealtimeInfo Signal
function getRealtimeInfo(state: RootState) {
  return {
    projectId: state.ui.activeProject,
    outcomeBeingEdited: state.ui.outcomeEditing,
    outcomeExpandedView: state.ui.expandedView.outcomeActionHash,
  }
}
export { realtimeInfoWatcher }
