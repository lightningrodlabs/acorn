import { RELATION_AS_PARENT, resetOutcomeConnector } from './actions'
import {
  createConnection,
  deleteConnection,
} from '../../persistent/projects/connections/actions'
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
    const fromAsParent = relation === RELATION_AS_PARENT
    const createdConnection = await projectsZomeApi.connection.create(cellId, {
      parentActionHash: fromAsParent ? fromAddress : toAddress,
      childActionHash: fromAsParent ? toAddress : fromAddress,
      randomizer: Date.now(),
      isImported: false,
    })
    const createConnectionAction = createConnection(
      activeProject,
      createdConnection
    )
    dispatch(createConnectionAction)
  }
  dispatch(resetOutcomeConnector())
}
