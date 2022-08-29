import React, { useState } from 'react'
import './ConnectionConnectors.scss'
import {
  outcomeWidth,
  getOutcomeHeight,
  CONNECTOR_VERTICAL_SPACING,
} from '../../drawing/dimensions'
import {
  RELATION_AS_CHILD,
  RELATION_AS_PARENT,
} from '../../redux/ephemeral/connection-connector/actions'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import handleConnectionConnectMouseUp from '../../redux/ephemeral/connection-connector/handler'
import { calculateValidChildren, calculateValidParents } from '../../tree-logic'

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
  projectTags,
  outcome,
  ownExistingParentConnectionAddress,
  presetExistingParentConnectionAddress,
  fromAddress,
  relation,
  toAddress,
  address,
  outcomeCoordinates,
  canvas,
  setConnectionConnectorFrom,
  setConnectionConnectorTo,
  connections,
  outcomeActionHashes,
  translate,
  zoomLevel,
  dispatch,
}) => {
  const ctx = canvas.getContext('2d')
  const outcomeHeight = getOutcomeHeight({
    ctx,
    outcome,
    projectTags,
    zoomLevel,
    width: outcomeWidth,
  })

  // calculate the coordinates on the page, based
  // on what the coordinates on the canvas would be
  const { x: topConnectorLeft, y: topConnectorTop } = coordsCanvasToPage(
    {
      x: outcomeCoordinates.x + outcomeWidth / 2,
      y: outcomeCoordinates.y - CONNECTOR_VERTICAL_SPACING,
    },
    translate,
    zoomLevel
  )
  const { x: bottomConnectorLeft, y: bottomConnectorTop } = coordsCanvasToPage(
    {
      x: outcomeCoordinates.x + outcomeWidth / 2,
      y: outcomeCoordinates.y + outcomeHeight + CONNECTOR_VERTICAL_SPACING,
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
    !topConnectorActive && (!relation || relation === RELATION_AS_CHILD)

  // shared code for mouse event handlers
  const connectionConnectMouseDown = (direction, validity) => () => {
    if (!fromAddress) {
      setConnectionConnectorFrom(
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
    // cannot set 'to' the very same Outcome
    if (fromAddress && address !== fromAddress)
      setConnectionConnectorTo(address)
  }
  const connectorOnMouseOut = () => {
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
  projectTags,
  translate,
  zoomLevel,
  outcomes,
  connections,
  outcomeActionHashes,
  coordinates,
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
  return connectorAddresses.map((connectorAddress) => {
    const outcomeCoordinates = coordinates[connectorAddress]
    const outcome = outcomes[connectorAddress]
    // look for an existing connection that defines a parent
    // of this Outcome, so that it can be deleted
    // if it is to be changed and a new one added
    const hasParent = connections.find(
      (connection) => connection.childActionHash === connectorAddress
    )
    return (
      <>
        {outcomeCoordinates && (
          <ConnectionConnector
            key={connectorAddress}
            activeProject={activeProject}
            projectTags={projectTags}
            outcome={outcome}
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
            setConnectionConnectorFrom={setConnectionConnectorFrom}
            setConnectionConnectorTo={setConnectionConnectorTo}
            outcomeCoordinates={outcomeCoordinates}
            canvas={canvas}
            dispatch={dispatch}
            translate={translate}
            zoomLevel={zoomLevel}
          />
        )}
      </>
    )
  })
}
export default ConnectionConnectors
