import { createSelector } from 'reselect'
import { RootState } from '../redux/reducer'
import { HeaderHashB64 } from '../types/shared'

const selectOutcomeAndAncestors = createSelector(
  (state: RootState) => state.ui.expandedView.outcomeHeaderHash,
  (state: RootState) =>
    state.projects.connections[state.ui.activeProject] || {},
  (outcomeHeaderHash, connections) => {
    const outcomeAndAncestorsHeaderHashes = []
    // find any parent recursively, and prepend it
    const connectionsArray = Object.keys(connections).map(
      (headerHash) => connections[headerHash]
    )
    function findParentAndPrepend(childHeaderHash: HeaderHashB64) {
      const parentConnection = connectionsArray.find(
        (connection) => connection.childHeaderHash === childHeaderHash
      )
      if (parentConnection) {
        outcomeAndAncestorsHeaderHashes.unshift(
          parentConnection.parentHeaderHash
        )
        // recurse
        findParentAndPrepend(parentConnection.parentHeaderHash)
      }
    }

    if (outcomeHeaderHash) {
      // add itself, it should end up at the end (last) in the list
      outcomeAndAncestorsHeaderHashes.push(outcomeHeaderHash)
      findParentAndPrepend(outcomeHeaderHash)
    }
    return outcomeAndAncestorsHeaderHashes
  }
)

export default selectOutcomeAndAncestors
