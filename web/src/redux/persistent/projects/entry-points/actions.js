/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { PROJECTS_ZOME_NAME } from '../../../../holochainConfig'
import { createCrudActionCreators } from '../../crudRedux'
import { createZomeCallAsyncAction } from 'connoropolous-hc-redux-middleware'

const FETCH_ENTRY_POINT_DETAILS = 'fetch_entry_point_details'

const fetchEntryPointDetails = createZomeCallAsyncAction(
  PROJECTS_ZOME_NAME,
  FETCH_ENTRY_POINT_DETAILS
)

const [
  createEntryPoint,
  fetchEntryPoints,
  updateEntryPoint,
  archiveEntryPoint,
] = createCrudActionCreators(PROJECTS_ZOME_NAME, 'entry_point')

export {
  createEntryPoint,
  fetchEntryPoints,
  updateEntryPoint,
  archiveEntryPoint,
  // non-standard
  fetchEntryPointDetails,
}
