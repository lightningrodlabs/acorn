/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/
import ProjectZomeApi from '../../../../api/projectsApi'
import { getAppWs } from '../../../../hcWebsockets'
import { Connection } from '../../../../types'
import { Action, CellIdString } from '../../../../types/shared'
import { cellIdFromString } from '../../../../utils'
import { createCrudActionCreators } from '../../crudRedux'

/* action creator functions */

const PREVIEW_CONNECTIONS = 'PREVIEW_CONNECTIONS'
const CLEAR_CONNECTIONS_PREVIEW = 'CLEAR_CONNECTIONS_PREVIEW'
const AFFECT_LAYOUT_DELETE_CONNECTION = 'AFFECT_LAYOUT_DELETE_CONNECTION'

const previewConnections = (cellId: CellIdString, connections: Array<Connection>): Action<{cellId: CellIdString, connections: Array<Connection>}> => {
  return {
    type: PREVIEW_CONNECTIONS,
    payload: {
      cellId,
      connections,
    },
  }
}

const clearConnectionsPreview = (cellId: CellIdString): Action<{cellId: CellIdString}> => {
  return {
    type: CLEAR_CONNECTIONS_PREVIEW,
    payload: {
      cellId,
    },
  }
}

const [[
  CREATE_CONNECTION,
  FETCH_CONNECTIONS,
  UPDATE_CONNECTION,
  DELETE_CONNECTION
],[
  createConnection,
  fetchConnections,
  updateConnection,
  deleteConnection
]] = createCrudActionCreators<Connection>('CONNECTION')

export {
  CREATE_CONNECTION,
  FETCH_CONNECTIONS,
  UPDATE_CONNECTION,
  DELETE_CONNECTION,
  PREVIEW_CONNECTIONS,
  CLEAR_CONNECTIONS_PREVIEW,
  AFFECT_LAYOUT_DELETE_CONNECTION,
  createConnection,
  fetchConnections,
  updateConnection,
  deleteConnection,
  previewConnections,
  clearConnectionsPreview,
}
