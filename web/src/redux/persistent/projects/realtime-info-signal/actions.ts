import { CellIdString } from "../../../../types/shared"

const SEND_REALTIME_INFO = 'SEND_REALTIME_INFO'
const SEND_EXIT_PROJECT_SIGNAL = 'SEND_EXIT_PROJECT_SIGNAL'

function triggerRealtimeInfoSignal() {
  return {
    type: SEND_REALTIME_INFO,
    payload: {},
  }
}

function sendExitProjectSignal(projectId: CellIdString) {
  return {
    type: SEND_EXIT_PROJECT_SIGNAL,
    payload: projectId,
  }
}

export {
  SEND_REALTIME_INFO,
  SEND_EXIT_PROJECT_SIGNAL,
  triggerRealtimeInfoSignal,
  sendExitProjectSignal,
}
