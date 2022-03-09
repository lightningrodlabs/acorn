/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/


import { PROFILES_ZOME_NAME } from '../../../../holochainConfig'

/* action creator functions */

const whoami = createZomeCallAsyncAction(PROFILES_ZOME_NAME, 'whoami')

const createWhoami = createZomeCallAsyncAction(
  PROFILES_ZOME_NAME,
  'create_whoami'
)

const updateWhoami = createZomeCallAsyncAction(
  PROFILES_ZOME_NAME,
  'update_whoami'
)

export { whoami, createWhoami, updateWhoami }
