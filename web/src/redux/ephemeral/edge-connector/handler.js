import { RELATION_AS_PARENT, resetEdgeConnector } from './actions'
import { createEdge, layoutAffectingArchiveEdge } from '../../persistent/projects/edges/actions'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'

export default async function handleEdgeConnectMouseUp(
  fromAddress,
  relation,
  toAddress,
  // ASSUMPTION: one parent
  existingParentEdgeAddress,
  activeProject,
  dispatch
) {
  //TODO: convert activeProject into buffer
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  if (fromAddress && toAddress) {
    // if we are replacing an edge with this one
    // delete the existing edge first
    // ASSUMPTION: one parent
    if (existingParentEdgeAddress) {
      // false because we will only be archiving
      // an edge here in the context of immediately replacing
      // it with another
      const affectLayout = false
      await dispatch(layoutAffectingArchiveEdge(activeProject, existingParentEdgeAddress, affectLayout))
    }

    const fromAsParent = relation === RELATION_AS_PARENT
    const createdConnection = await projectsZomeApi.connection.create(cellId, {
        parent_address: fromAsParent ? fromAddress : toAddress,
        child_address: fromAsParent ? toAddress : fromAddress,
        randomizer: Date.now(),
        is_imported: false
      })
    const createEdgeAction = createEdge(activeProject, createdConnection)
    dispatch(createEdgeAction)
  }
  dispatch(resetEdgeConnector())
}
