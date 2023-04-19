import React from 'react'
import './OutcomeConnectors.scss'
import { CONNECTOR_VERTICAL_SPACING } from '../../drawing/dimensions'
import {
  RELATION_AS_CHILD,
  RELATION_AS_PARENT,
} from '../../redux/ephemeral/outcome-connector/actions'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import handleConnectionConnectMouseUp from '../../redux/ephemeral/outcome-connector/handler'
import { calculateValidChildren, calculateValidParents } from '../../tree-logic'

const OutcomeConnectorHtml = ({
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
      className={`outcome-connector ${active ? 'active' : ''}`}
      style={{ top: `${pixelTop}px`, left: `${pixelLeft}px` }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <div className="outcome-connector-blue-dot" />
    </div>
  )
}

const OutcomeConnector = ({
  activeProject,
  ownExistingParentConnectionAddress,
  presetExistingParentConnectionAddress,
  fromAddress,
  relation,
  toAddress,
  address,
  outcomeCoordinates,
  outcomeDimensions,
  isCollapsed,
  setOutcomeConnectorFrom,
  setOutcomeConnectorTo,
  connections,
  outcomeActionHashes,
  translate,
  zoomLevel,
  dispatch,
}) => {
  // calculate the coordinates on the page, based
  // on what the coordinates on the canvas would be
  const { x: topConnectorLeft, y: topConnectorTop } = coordsCanvasToPage(
    {
      x: outcomeCoordinates.x + outcomeDimensions.width / 2,
      y: outcomeCoordinates.y - CONNECTOR_VERTICAL_SPACING,
    },
    translate,
    zoomLevel
  )
  const { x: bottomConnectorLeft, y: bottomConnectorTop } = coordsCanvasToPage(
    {
      x: outcomeCoordinates.x + outcomeDimensions.width / 2,
      y:
        outcomeCoordinates.y +
        outcomeDimensions.height +
        CONNECTOR_VERTICAL_SPACING,
    },
    translate,
    zoomLevel
  )

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
    !topConnectorActive &&
    (!relation || relation === RELATION_AS_CHILD) &&
    !isCollapsed

  // shared code for mouse event handlers
  const connectionConnectMouseDown = (direction, validity) => () => {
    if (!fromAddress) {
      setOutcomeConnectorFrom(
        address,
        direction,
        validity(address, connections, outcomeActionHashes),
        // we don't think about overriding the existing
        // parent when it comes to children, since it can have many
        // ASSUMPTION: one parent
        direction === RELATION_AS_CHILD
          ? ownExistingParentConnectionAddress
          : undefined
      )
    }
  }
  const connectionConnectMouseUp = () => {
    handleConnectionConnectMouseUp(
      fromAddress,
      relation,
      toAddress,
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
    // cannot set 'to' the very same Outcome
    if (fromAddress && address !== fromAddress) setOutcomeConnectorTo(address)
  }
  const connectorOnMouseOut = () => {
    setOutcomeConnectorTo(null)
  }

  return (
    <>
      {/* top connector */}
      {(canShowTopConnector || topConnectorActive) && (
        <OutcomeConnectorHtml
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
        <OutcomeConnectorHtml
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

const OutcomeConnectors = ({
  outcomes,
  activeProject,
  translate,
  zoomLevel,
  connections,
  coordinates,
  dimensions,
  fromAddress,
  relation,
  toAddress,
  existingParentConnectionAddress,
  connectorAddresses,
  collapsedOutcomes,
  setOutcomeConnectorFrom,
  setOutcomeConnectorTo,
  dispatch,
}) => {
  // convert from object to array
  const outcomeActionHashes = Object.keys(outcomes)
  return connectorAddresses.map((connectorAddress) => {
    const outcomeCoordinates = coordinates[connectorAddress]
    const outcomeDimensions = dimensions[connectorAddress]
    const isCollapsed = collapsedOutcomes[connectorAddress]
    // look for an existing connection that defines a parent
    // of this Outcome, so that it can be deleted
    // if it is to be changed and a new one added
    const hasParent = connections.find(
      (connection) => connection.childActionHash === connectorAddress
    )
    return (
      <div key={connectorAddress}>
        {outcomeCoordinates && outcomeDimensions && (
          <OutcomeConnector
            activeProject={activeProject}
            connections={connections}
            outcomeActionHashes={outcomeActionHashes}
            fromAddress={fromAddress}
            relation={relation}
            toAddress={toAddress}
            ownExistingParentConnectionAddress={
              hasParent && hasParent.actionHash
            }
            presetExistingParentConnectionAddress={
              existingParentConnectionAddress
            }
            address={connectorAddress}
            setOutcomeConnectorFrom={setOutcomeConnectorFrom}
            setOutcomeConnectorTo={setOutcomeConnectorTo}
            outcomeCoordinates={outcomeCoordinates}
            outcomeDimensions={outcomeDimensions}
            dispatch={dispatch}
            translate={translate}
            zoomLevel={zoomLevel}
            isCollapsed={isCollapsed}
          />
        )}
      </div>
    )
  })
}
export default OutcomeConnectors
