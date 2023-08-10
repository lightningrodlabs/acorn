import { CoordinatesState } from './redux/ephemeral/layout/state-type'
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
      !descendants.includes(outcomeActionHash) &&
      !isAncestor(fromAddress, outcomeActionHash, connections)
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

function findParentsActionHashes(
  childActionHash: ActionHashB64,
  state: RootState
): string[] {
  const connections = state.projects.connections[state.ui.activeProject] || {}
  const connectionsArray = Object.values(connections)

  const parentConnections = connectionsArray.filter(
    (connection) => connection.childActionHash === childActionHash
  )
  const parentActionHashes = parentConnections.map(
    (connection) => connection.parentActionHash
  )

  return parentActionHashes
}

function findChildrenActionHashes(
  parentActionHash: ActionHashB64,
  state: RootState
): string[] {
  const connections = state.projects.connections[state.ui.activeProject] || {}
  const connectionsArray = Object.values(connections)
  const childConnections = connectionsArray.filter(
    (connection) => connection.parentActionHash === parentActionHash
  )
  const childActionHashes = childConnections.map(
    (connection) => connection.childActionHash
  )
  return childActionHashes
}

// Which direction of the list of children
// should we navigate in?
enum RightOrLeft {
  Right,
  Left,
}

function getSiblings(
  connectionsArray: WithActionHash<Connection>[],
  parentConnections: WithActionHash<Connection>[],
  layoutCoords: CoordinatesState
): ActionHashB64[] {
  let siblings = connectionsArray
    // find all connections that share any (.find) parent with the selected outcome
    .filter((connection) =>
      parentConnections.find(
        (parentConnection) =>
          parentConnection.parentActionHash === connection.parentActionHash
      )
    )
    // only keep the action hashes
    .map((connection) => connection.childActionHash)
  // make unique
  siblings = [...new Set(siblings)]

  // sort by x coordinate left -> right
  return siblings.sort((a, b) => {
    const aCoords = layoutCoords[a]
    const bCoords = layoutCoords[b]
    if (aCoords && bCoords) {
      return aCoords.x - bCoords.x
    }
  })
}

function pickSiblingIndexFromDirection(
  siblings: string[],
  childActionHash: string,
  direction: RightOrLeft
): number {
  // index of this child in the list of all children
  const selfIndex = siblings.indexOf(childActionHash)
  // left or right?
  return selfIndex + (direction === RightOrLeft.Left ? -1 : 1)
}

function findSiblingActionHash(
  childActionHash: ActionHashB64,
  state: RootState,
  direction: RightOrLeft
) {
  const connections = state.projects.connections[state.ui.activeProject] || {}
  const outcomes = state.projects.outcomes[state.ui.activeProject] || {}
  const connectionsArray = Object.values(connections)
  const layoutCoords = state.ui.layout.coordinates

  const parentConnections = connectionsArray.filter(
    (connection) => connection.childActionHash === childActionHash
  )
  // there is at least 1 parent
  if (parentConnections.length) {
    const siblings = getSiblings(
      connectionsArray,
      parentConnections,
      layoutCoords
    )
    const pickSiblingAtIndex = pickSiblingIndexFromDirection(
      siblings,
      childActionHash,
      direction
    )

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

    // sort by x coordinate left -> right
    noParentsAddresses.sort((a, b) => {
      const aCoords = layoutCoords[a]
      const bCoords = layoutCoords[b]
      if (aCoords && bCoords) {
        return aCoords.x - bCoords.x
      }
    })

    const pickOutcomeAtIndex = pickSiblingIndexFromDirection(
      noParentsAddresses,
      childActionHash,
      direction
    )

    return noParentsAddresses[pickOutcomeAtIndex]
  }
}

export {
  calculateValidParents,
  calculateValidChildren,
  isAncestor,
  allDescendants,
  findParentsActionHashes,
  findChildrenActionHashes,
  findSiblingActionHash,
  RightOrLeft,
}
