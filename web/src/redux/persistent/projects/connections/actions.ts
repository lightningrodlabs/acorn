/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/
import { Connection } from '../../../../types'
import { createCrudActionCreators } from '../../crudRedux'

/* action creator functions */

const AFFECT_LAYOUT_DELETE_CONNECTION = 'AFFECT_LAYOUT_DELETE_CONNECTION'

const [
  [CREATE_CONNECTION, FETCH_CONNECTIONS, UPDATE_CONNECTION, DELETE_CONNECTION],
  [createConnection, fetchConnections, updateConnection, deleteConnection],
] = createCrudActionCreators<Connection>('CONNECTION')

export {
  CREATE_CONNECTION,
  FETCH_CONNECTIONS,
  UPDATE_CONNECTION,
  DELETE_CONNECTION,
  AFFECT_LAYOUT_DELETE_CONNECTION,
  createConnection,
  fetchConnections,
  updateConnection,
  deleteConnection,
}
