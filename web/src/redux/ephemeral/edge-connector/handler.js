import { RELATION_AS_PARENT, resetEdgeConnector } from './actions'
import { createEdge, layoutAffectingArchiveEdge } from '../projects/edges/actions'

export default async function handleEdgeConnectMouseUp(
  fromAddress,
  relation,
  toAddress,
  // ASSUMPTION: one parent
  existingParentEdgeAddress,
  activeProject,
  dispatch
) {
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
