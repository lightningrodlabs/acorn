import { RootState } from './redux/reducer'
import { Connection } from './types'
import { ActionHashB64, WithActionHash } from './types/shared'

// checks if 'checkAddress' is an ancestor of 'descendantAddress', by looking through 'connections'
// is relatively easy because each Outcome only has ONE parent
// e.g. we can walk straight up the tree to the top
function isAncestor(
  descendantAddress: ActionHashB64,
  checkAddress: ActionHashB64,
  connections: WithActionHash<Connection>[]
) {
  const connectionWithParent = connections.find(
    (connection) => connection.childActionHash === descendantAddress
  )
  if (connectionWithParent) {
    if (connectionWithParent.parentActionHash === checkAddress) {
      return true
    } else {
      return isAncestor(
        connectionWithParent.parentActionHash,
        checkAddress,
        connections
      )
    }
  } else {
    // if node has no ancestors, then checkAddress must not be an ancestor
    return false
  }
}

// as long as there are no cycles in the tree this will work wonderfully
function allDescendants(
  ancestorAddress: ActionHashB64,
  connections: WithActionHash<Connection>[],
  accumulator: ActionHashB64[] = []
) {
  const children = connections
    .filter((connection) => connection.parentActionHash === ancestorAddress)
    .map((connection) => connection.childActionHash)
  return accumulator
    .concat(
      children.map((address) => allDescendants(address, connections, children))
    )
    .flat()
}

/*
validate connections that can be created:
relation as child, other node MUST
- not be itself
- not be a descendant of 'from' node, to prevent cycles in the tree
*/
function calculateValidParents(
  fromAddress: ActionHashB64,
  connections: WithActionHash<Connection>[],
  outcomeActionHashes: ActionHashB64[]
) {
  const descendants = allDescendants(fromAddress, connections)
  return outcomeActionHashes.filter((outcomeActionHash) => {
    return (
      // filter out self-address in the process
      outcomeActionHash !== fromAddress &&
      // filter out any descendants
      !descendants.includes(outcomeActionHash)
    )
  })
}

/*
validate connections that can be created:
relation as parent, other node MUST
- not be itself
- have no parent
- not be the root ancestor of 'from' node, to prevent cycles in the tree
*/
function calculateValidChildren(
  fromAddress: ActionHashB64,
  connections: WithActionHash<Connection>[],
  outcomeActionHashes: ActionHashB64[]
) {
  return outcomeActionHashes.filter((outcomeActionHash) => {
    return (
      // filter out self
      outcomeActionHash !== fromAddress &&
      // find the Outcome objects that are not descendants of the fromAddress
      // since we don't want to create cycles
      !isAncestor(outcomeActionHash, fromAddress, connections) &&
      !isAncestor(fromAddress, outcomeActionHash, connections)
    )
  })
}

function findParentActionHash(
  childActionHash: ActionHashB64,
  state: RootState
) {
  const connections = state.projects.connections[state.ui.activeProject] || {}
  const connectionsArray = Object.values(connections)
  // ASSUMPTION: one-parent
  // just takes first it finds
  const parentConnection = connectionsArray.find(
    (connection) => connection.childActionHash === childActionHash
  )
  return parentConnection ? parentConnection.parentActionHash : undefined
}

function findFirstChildActionHash(
  parentActionHash: ActionHashB64,
  state: RootState
) {
  const connections = state.projects.connections[state.ui.activeProject] || {}
  const connectionsArray = Object.values(connections)
  const childConnection = connectionsArray.find(
    (connection) => connection.parentActionHash === parentActionHash
  )
  return childConnection ? childConnection.childActionHash : undefined
}

// Which direction of the list of children
// should we navigate in?
enum RightOrLeft {
  Right,
  Left,
}

function findSiblingActionHash(
  childActionHash: ActionHashB64,
  state: RootState,
  direction: RightOrLeft
) {
  const connections = state.projects.connections[state.ui.activeProject] || {}
  const outcomes = state.projects.outcomes[state.ui.activeProject] || {}
  const connectionsArray = Object.values(connections)
  // ASSUMPTION: one-parent
  // just takes first it finds
  const parentConnection = connectionsArray.find(
    (connection) => connection.childActionHash === childActionHash
  )
  if (parentConnection) {
    const siblings = connectionsArray
      .filter(
        (connection) =>
          connection.parentActionHash === parentConnection.parentActionHash
      )
      .map((connection) => connection.childActionHash)
    // index of this child in the list of all children
    const selfIndex = siblings.indexOf(childActionHash)
    // left or right?
    const pickSiblingAtIndex =
      selfIndex + (direction === RightOrLeft.Left ? -1 : 1)
    return siblings[pickSiblingAtIndex]
  } else {
    // we are in a root node
    // pretend like it is a child of the 'Project' and nav to the root note
    // left or right to this one
    const allOutcomeAddresses = Object.values(outcomes).map(
      (outcome) => outcome.actionHash
    )
    // this logic matches the logic in `outcomesAsTrees.ts` which is important
    // because that's how it decides in which order to render things
    const noParentsAddresses = allOutcomeAddresses.filter(
      (outcomeActionHash) => {
        return !connectionsArray.find(
          (connection) => connection.childActionHash === outcomeActionHash
        )
      }
    )
    // index of this outcome in the list of all those outcomes without parents
    const selfIndex = noParentsAddresses.indexOf(childActionHash)
    // left or right?
    const pickOutcomeAtIndex =
      selfIndex + (direction === RightOrLeft.Left ? -1 : 1)
    return noParentsAddresses[pickOutcomeAtIndex]
  }
}

export {
  calculateValidParents,
  calculateValidChildren,
  isAncestor,
  allDescendants,
  findParentActionHash,
  findFirstChildActionHash,
  findSiblingActionHash,
  RightOrLeft,
}
