const SEND_REALTIME_INFO = 'SEND_REALTIME_INFO'
const SEND_EXIT_PROJECT_SIGNAL = 'SEND_EXIT_PROJECT_SIGNAL'

function triggerRealtimeInfoSignal() {
  return {
    type: SEND_REALTIME_INFO,
    payload: {},
  }
}

function sendExitProjectSignal() {
  return {
    type: SEND_EXIT_PROJECT_SIGNAL,
    payload: {},
  }
}

export {
  SEND_REALTIME_INFO,
  SEND_EXIT_PROJECT_SIGNAL,
  triggerRealtimeInfoSignal,
  sendExitProjectSignal,
}
