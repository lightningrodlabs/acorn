import { RELATION_AS_PARENT, resetEdgeConnector } from './actions'
import { createEdge, archiveEdge } from '../projects/edges/actions'

export default async function handleEdgeConnectMouseUp(
  fromAddress,
  relation,
  toAddress,
  existingParentEdgeAddress,
  activeProject,
  dispatch
) {
  if (fromAddress && toAddress) {
    // if we are replacing an edge with this one
    // delete the existing edge first
    if (existingParentEdgeAddress) {
      await dispatch(archiveEdge.create({
        cellIdString: activeProject,
        payload: existingParentEdgeAddress,
      }))
    }

    const fromAsParent = relation === RELATION_AS_PARENT
    const createEdgeAction = createEdge.create({
      cellIdString: activeProject,
      payload: {
        parent_address: fromAsParent ? fromAddress : toAddress,
        child_address: fromAsParent ? toAddress : fromAddress,
        randomizer: Date.now(),
        is_imported: false
      },
    })
    dispatch(createEdgeAction)
  }
  dispatch(resetEdgeConnector())
}
