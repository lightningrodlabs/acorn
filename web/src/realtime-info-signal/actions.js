import { createZomeCallAsyncAction } from 'connoropolous-hc-redux-middleware'

import { PROJECTS_ZOME_NAME } from '../holochainConfig'


const sendRealtimeInfoSignal = createZomeCallAsyncAction(
  PROJECTS_ZOME_NAME,
  'emit_realtime_info_signal'
)

export { sendRealtimeInfoSignal }