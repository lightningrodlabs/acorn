import { RELATION_AS_PARENT, resetEdgeConnector } from './actions'
import { createEdge } from '../projects/edges/actions'

export default function handleEdgeConnectMouseUp(
  fromAddress,
  relation,
  toAddress,
  activeProject,
  dispatch
) {
  if (fromAddress && toAddress) {
    // TODO: delete the existing edge first
    // if we are replacing an edge with this one

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
