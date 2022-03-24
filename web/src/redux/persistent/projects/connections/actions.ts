/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/
import ProjectZomeApi from '../../../../api/projectsApi'
import { getAppWs } from '../../../../hcWebsockets'
import { Connection } from '../../../../types'
import { cellIdFromString } from '../../../../utils'
import { createCrudActionCreators } from '../../crudRedux'

/* action creator functions */

const PREVIEW_CONNECTIONS = 'PREVIEW_CONNECTIONS'
const CLEAR_CONNECTIONS_PREVIEW = 'CLEAR_CONNECTIONS_PREVIEW'
const AFFECT_LAYOUT_DELETE_CONNECTION = 'AFFECT_LAYOUT_DELETE_CONNECTION'

const previewConnections = (cellId, connections) => {
  return {
    type: PREVIEW_CONNECTIONS,
    payload: {
      cellId,
      connections,
    },
  }
}

const clearConnectionsPreview = cellId => {
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

// this action gets caught and
// handled in the web/src/layout/middleware.js
// it allows the dispatcher of a usual 'deleteConnection' action
// to specify whether that action should or shouldn't trigger
// a layout update on its successful completion of the call
const affectLayoutDeleteConnection = async (cellIdString, payload, affectLayout) => {
  const cellId = cellIdFromString(cellIdString)
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectZomeApi(appWebsocket)
  await projectsZomeApi.connection.delete(cellId, payload) 
  return {
    type: AFFECT_LAYOUT_DELETE_CONNECTION,
    affectLayout,
  }
}

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
  affectLayoutDeleteConnection
}
