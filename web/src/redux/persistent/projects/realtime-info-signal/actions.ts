import { RealtimeInfoInput } from "../../../../types"
import { Action, CellIdString } from "../../../../types/shared"

const SEND_REALTIME_INFO = 'SEND_REALTIME_INFO'
const SEND_EXIT_PROJECT_SIGNAL = 'SEND_EXIT_PROJECT_SIGNAL'
const SEND_REALTIME_INFO_SIGNAL = 'SEND_REALTIME_INFO_SIGNAL'

// TODO: do we want typescript interface for the realtime signal object?
const sendRealtimeInfoSignal = (cellIdString: CellIdString, payload: RealtimeInfoInput): Action<RealtimeInfoInput> => {
  return {
    type: SEND_REALTIME_INFO_SIGNAL,
    payload,
    meta: { cellIdString }
  }
}

function triggerRealtimeInfoSignal() {
  return {
    type: SEND_REALTIME_INFO,
    payload: {}
  }
}

function sendExitProjectSignal() {
  return {
    type: SEND_EXIT_PROJECT_SIGNAL,
    payload: {}
  }
}

export { sendRealtimeInfoSignal, SEND_REALTIME_INFO_SIGNAL, SEND_REALTIME_INFO, SEND_EXIT_PROJECT_SIGNAL, triggerRealtimeInfoSignal, sendExitProjectSignal }