import { createZomeCallAsyncAction } from 'connoropolous-hc-redux-middleware'

import { PROJECTS_ZOME_NAME } from '../holochainConfig'


const sendEditSignal = createZomeCallAsyncAction(
  PROJECTS_ZOME_NAME,
  'emit_editing_goal_signal'
)

export { sendEditSignal }