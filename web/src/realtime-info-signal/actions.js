import { createZomeCallAsyncAction } from 'connoropolous-hc-redux-middleware'

import { PROJECTS_ZOME_NAME } from '../holochainConfig'

const SEND_REALTIME_INFO = 'SEND_REALTIME_INFO'
const SEND_EXIT_PROJECT_SIGNAL = 'SEND_EXIT_PROJECT_SIGNAL'

const sendRealtimeInfoSignal = createZomeCallAsyncAction(
  PROJECTS_ZOME_NAME,
  'emit_realtime_info_signal'
)

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

export { sendRealtimeInfoSignal, SEND_REALTIME_INFO, SEND_EXIT_PROJECT_SIGNAL, triggerRealtimeInfoSignal, sendExitProjectSignal }