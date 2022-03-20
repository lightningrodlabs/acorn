import React, { useState } from 'react'
import './ConnectionConnectors.scss'
import { Transition, TransitionGroup } from 'react-transition-group'
import {
  outcomeWidth,
  getOutcomeHeight,
  CONNECTOR_VERTICAL_SPACING,
} from '../../drawing/dimensions'
import {
  RELATION_AS_CHILD,
  RELATION_AS_PARENT,
} from '../../redux/ephemeral/connection-connector/actions'
import handleConnectionConnectMouseUp from '../../redux/ephemeral/connection-connector/handler'

// checks if 'checkAddress' is an ancestor of 'descendantAddress', by looking through 'connections'
// is relatively easy because each Outcome only has ONE parent
// e.g. we can walk straight up the tree to the top
function isAncestor(descendantAddress, checkAddress, connections) {
  const connectionWithParent = connections.find(
    (connection) => connection.child_address === descendantAddress
  )
  if (connectionWithParent) {
    if (connectionWithParent.parent_address === checkAddress) {
      return true
    } else {
      return isAncestor(connectionWithParent.parent_address, checkAddress, connections)
    }
  } else {
    // if node has no ancestors, then checkAddress must not be an ancestor
    return false
  }
}

// as long as there are no cycles in the tree this will work wonderfully
function allDescendants(ancestorAddress, connections, accumulator = []) {
  const children = connections
    .filter((connection) => connection.parent_address === ancestorAddress)
    .map((connection) => connection.child_address)
  return accumulator
    .concat(children.map((address) => allDescendants(address, connections, children)))
    .flat()
}

/*
validate connections that can be created:
relation as child, other node MUST
- not be itself
- not be a descendant of 'from' node, to prevent cycles in the tree
*/
function calculateValidParents(fromAddress, connections, outcomeAddresses) {
  const descendants = allDescendants(fromAddress, connections)
  return outcomeAddresses.filter((outcomeAddress) => {
    return (
      // filter out self-address in the process
      outcomeAddress !== fromAddress &&
      // filter out any descendants
      !descendants.includes(outcomeAddress)
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
export function calculateValidChildren(fromAddress, connections, outcomeAddresses) {
  return outcomeAddresses.filter((outcomeAddress) => {
    return (
      // filter out self-address in the process
      outcomeAddress !== fromAddress &&
      // find the Outcome objects without parent Outcomes
      // since they will sit at the top level
      !connections.find((connection) => connection.child_address === outcomeAddress) &&
      !isAncestor(fromAddress, outcomeAddress, connections)
    )
  })
}

const ConnectionConnectorHtml = ({
  active,
  pixelTop,
  pixelLeft,
  onMouseDown,
  onMouseUp,
  onMouseOver,
  onMouseOut,
}) => {
  return (
    <div
      className={`connection-connector ${active ? 'active' : ''}`}
      style={{ top: `${pixelTop}px`, left: `${pixelLeft}px` }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <div className="connection-connector-blue-dot" />
    </div>
  )
}

const ConnectionConnector = ({
  activeProject,
  outcome,
  ownExistingParentConnectionAddress,
  presetExistingParentConnectionAddress,
  fromAddress,
  relation,
  toAddress,
  address,
  outcomeCoordinates,
  coordsCanvasToPage,
  canvas,
  setConnectionConnectorFrom,
  setConnectionConnectorTo,
  setHoveredConnectionConnector,
  connections,
  outcomeAddresses,
  dispatch,
}) => {
  const ctx = canvas.getContext('2d')
  const outcomeHeight = getOutcomeHeight(ctx, outcome.content)

  // calculate the coordinates on the page, based
  // on what the coordinates on the canvas would be
  const { x: topConnectorLeft, y: topConnectorTop } = coordsCanvasToPage({
    x: outcomeCoordinates.x + outcomeWidth / 2,
    y: outcomeCoordinates.y - CONNECTOR_VERTICAL_SPACING,
  })
  const { x: bottomConnectorLeft, y: bottomConnectorTop } = coordsCanvasToPage({
    x: outcomeCoordinates.x + outcomeWidth / 2,
    y: outcomeCoordinates.y + outcomeHeight + CONNECTOR_VERTICAL_SPACING,
  })

  const topConnectorActive =
    (address === fromAddress && relation === RELATION_AS_CHILD) ||
    (toAddress && address === toAddress && relation === RELATION_AS_PARENT)
  const bottomConnectorActive =
    (address === fromAddress && relation === RELATION_AS_PARENT) ||
    (toAddress && address === toAddress && relation === RELATION_AS_CHILD)

  // a connection to this upper port would make this Outcome a child of the
  // current 'from' Outcome of the connection connector
  // if there is one
  const canShowTopConnector =
    !bottomConnectorActive && (!relation || relation === RELATION_AS_PARENT)

  // a connection to this lower port would make this Outcome a parent of the current 'from' Outcome of the connection connector
  // if there is one
  const canShowBottomConnector =
    !topConnectorActive && (!relation || relation === RELATION_AS_CHILD)

  // shared code for mouse event handlers
  const connectionConnectMouseDown = (direction, validity) => () => {
    if (!fromAddress) {
      setConnectionConnectorFrom(
        address,
        direction,
        validity(address, connections, outcomeAddresses),
        // we don't think about overriding the existing
        // parent when it comes to children, since it can have many
        // ASSUMPTION: one parent
        direction === RELATION_AS_CHILD ? ownExistingParentConnectionAddress : undefined
      )
    }
  }
  const connectionConnectMouseUp = () => {
    handleConnectionConnectMouseUp(
      fromAddress,
      relation,
      toAddress,
      // ASSUMPTION: one parent
      presetExistingParentConnectionAddress,
      activeProject,
      dispatch
    )
  }
  const topConnectorOnMouseDown = connectionConnectMouseDown(
    RELATION_AS_CHILD,
    calculateValidParents
  )
  const bottomConnectorOnMouseDown = connectionConnectMouseDown(
    RELATION_AS_PARENT,
    calculateValidChildren
  )

  const connectorOnMouseOver = () => {
    setHoveredConnectionConnector(address)
    // cannot set 'to' the very same Outcome
    if (fromAddress && address !== fromAddress) setConnectionConnectorTo(address)
  }
  const connectorOnMouseOut = () => {
    setHoveredConnectionConnector(null)
    setConnectionConnectorTo(null)
  }

  return (
    <>
      {/* top connector */}
      {(canShowTopConnector || topConnectorActive) && (
        <ConnectionConnectorHtml
          active={topConnectorActive}
          pixelTop={topConnectorTop}
          pixelLeft={topConnectorLeft}
          onMouseDown={topConnectorOnMouseDown}
          onMouseUp={connectionConnectMouseUp}
          onMouseOver={connectorOnMouseOver}
          onMouseOut={connectorOnMouseOut}
        />
      )}

      {/* bottom connector */}
      {(canShowBottomConnector || bottomConnectorActive) && (
        <ConnectionConnectorHtml
          active={bottomConnectorActive}
          pixelTop={bottomConnectorTop}
          pixelLeft={bottomConnectorLeft}
          onMouseDown={bottomConnectorOnMouseDown}
          onMouseUp={connectionConnectMouseUp}
          onMouseOver={connectorOnMouseOver}
          onMouseOut={connectorOnMouseOut}
        />
      )}
    </>
  )
}

const ConnectionConnectors = ({
  activeProject,
  outcomes,
  connections,
  outcomeAddresses,
  coordinates,
  coordsCanvasToPage,
  fromAddress,
  relation,
  toAddress,
  existingParentConnectionAddress,
  connectorAddresses,
  canvas,
  setConnectionConnectorFrom,
  setConnectionConnectorTo,
  dispatch,
}) => {
  const [hoveredConnectionConnector, setHoveredConnectionConnector] = useState(null)
  // work in the one currently being hovered over, if there is one
  // to the list of connection connectors that are eligible to stay
  connectorAddresses = connectorAddresses.concat(
    hoveredConnectionConnector ? [hoveredConnectionConnector] : []
  )
  return (
    <TransitionGroup>
      {connectorAddresses.map((connectorAddress) => {
        const outcomeCoordinates = coordinates[connectorAddress]
        const outcome = outcomes[connectorAddress]
        // look for an existing connection that defines a parent
        // of this Outcome, so that it can be deleted
        // if it is to be changed and a new one added
        const hasParent = connections.find(
          (connection) => connection.child_address === connectorAddress
        )
        return (
          <Transition key={connectorAddress} timeout={300}>
            {(state) => (
              <ConnectionConnector
                state={state}
                activeProject={activeProject}
                outcome={outcome}
                connections={connections}
                outcomeAddresses={outcomeAddresses}
                fromAddress={fromAddress}
                relation={relation}
                toAddress={toAddress}
                ownExistingParentConnectionAddress={hasParent && hasParent.headerHash}
                presetExistingParentConnectionAddress={existingParentConnectionAddress}
                address={connectorAddress}
                setConnectionConnectorFrom={setConnectionConnectorFrom}
                setConnectionConnectorTo={setConnectionConnectorTo}
                setHoveredConnectionConnector={setHoveredConnectionConnector}
                outcomeCoordinates={outcomeCoordinates}
                coordsCanvasToPage={coordsCanvasToPage}
                canvas={canvas}
                dispatch={dispatch}
              />
            )}
          </Transition>
        )
      })}
    </TransitionGroup>
  )
}
export default ConnectionConnectors