import { createSelector } from 'reselect'
import { RootState } from '../redux/reducer'
import { ActionHashB64 } from '../types/shared'

const selectOutcomeAndAncestors = createSelector(
  (state: RootState) => state.ui.expandedView.outcomeActionHash,
  (state: RootState) =>
    state.projects.connections[state.ui.activeProject] || {},
  (outcomeActionHash, connections) => {
    const outcomeAndAncestorsActionHashes = []
    // find any parent recursively, and prepend it
    const connectionsArray = Object.keys(connections).map(
      (actionHash) => connections[actionHash]
    )
    function findParentAndPrepend(childActionHash: ActionHashB64) {
      const parentConnection = connectionsArray.find(
        (connection) => connection.childActionHash === childActionHash
      )
      if (parentConnection) {
        outcomeAndAncestorsActionHashes.unshift(
          parentConnection.parentActionHash
        )
        // recurse
        findParentAndPrepend(parentConnection.parentActionHash)
      }
    }

    if (outcomeActionHash) {
      // add itself, it should end up at the end (last) in the list
      outcomeAndAncestorsActionHashes.push(outcomeActionHash)
      findParentAndPrepend(outcomeActionHash)
    }
    return outcomeAndAncestorsActionHashes
  }
)

export default selectOutcomeAndAncestors
