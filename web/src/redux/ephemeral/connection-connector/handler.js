import { RELATION_AS_PARENT, resetConnectionConnector } from './actions'
import { createConnection, deleteConnection } from '../../persistent/projects/connections/actions'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'
import { cellIdFromString } from '../../../utils'

export default async function handleConnectionConnectMouseUp(
  fromAddress,
  relation,
  toAddress,
  // ASSUMPTION: one parent
  existingParentConnectionAddress,
  activeProject,
  dispatch
) {
  const cellId = cellIdFromString(activeProject)
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  if (fromAddress && toAddress) {
    // if we are replacing an connection with this one
    // delete the existing connection first
    // ASSUMPTION: one parent
    if (existingParentConnectionAddress) {
      // don't trigger TRIGGER_LAYOUT_UPDATE here
      // because we will only be archiving
      // an connection here in the context of immediately replacing
      // it with another
      await projectsZomeApi.connection.delete(cellId, existingParentConnectionAddress)
      dispatch(deleteConnection(activeProject, existingParentConnectionAddress))
    }

    const fromAsParent = relation === RELATION_AS_PARENT
    const createdConnection = await projectsZomeApi.connection.create(cellId, {
        parentActionHash: fromAsParent ? fromAddress : toAddress,
        childActionHash: fromAsParent ? toAddress : fromAddress,
        randomizer: Date.now(),
        isImported: false
      })
    const createConnectionAction = createConnection(activeProject, createdConnection)
    dispatch(createConnectionAction)
  }
  dispatch(resetConnectionConnector())
}
