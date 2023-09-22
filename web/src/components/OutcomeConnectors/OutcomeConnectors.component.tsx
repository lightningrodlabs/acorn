import React from 'react'
import './OutcomeConnectors.scss'
import { CONNECTOR_VERTICAL_SPACING } from '../../drawing/dimensions'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import handleConnectionConnectMouseUp from '../../redux/ephemeral/outcome-connector/handler'
import { calculateValidChildren, calculateValidParents } from '../../tree-logic'
import {
  ComputedOutcome,
  Connection,
  LinkedOutcomeDetails,
  RelationInput,
} from '../../types'
import { OutcomeConnectorFromPayload } from '../../redux/ephemeral/outcome-connector/actions'
import {
  ActionHashB64,
  CellIdString,
  Option,
  WithActionHash,
} from '../../types/shared'
import { ViewportState } from '../../redux/ephemeral/viewport/state-type'
import {
  CoordinatesState,
  DimensionsState,
} from '../../redux/ephemeral/layout/state-type'

const { ExistingOutcomeAsChild, ExistingOutcomeAsParent } = RelationInput

export type OutcomeConnectorCommonStateProps = {
  activeProject: CellIdString
  translate: ViewportState['translate']
  zoomLevel: ViewportState['scale']
  connections: WithActionHash<Connection>[]
  maybeLinkedOutcome: Option<LinkedOutcomeDetails>
  toAddress: ActionHashB64
}

export type OutcomeConnectorCommonDispatchProps = {
  setOutcomeConnectorFrom: (payload: OutcomeConnectorFromPayload) => void
  setOutcomeConnectorTo: (address: ActionHashB64) => void
  dispatch: any
}

// Single
export type OutcomeConnectorProps = OutcomeConnectorCommonStateProps &
  OutcomeConnectorCommonDispatchProps & {
    ownExistingParentConnectionAddress: ActionHashB64
    presetExistingParentConnectionAddress: ActionHashB64
    address: ActionHashB64
    outcomeCoordinates: CoordinatesState[ActionHashB64]
    outcomeDimensions: DimensionsState[ActionHashB64]
    isCollapsed: boolean
    outcomeActionHashes: ActionHashB64[]
  }

// Plural
export type OutcomeConnectorsStateProps = OutcomeConnectorCommonStateProps & {
  collapsedOutcomes: {
    [outcomeActionHash: string]: boolean
  }
  coordinates: CoordinatesState
  dimensions: DimensionsState
  existingParentConnectionAddress: ActionHashB64
  connectorAddresses: ActionHashB64[]
}
export type OutcomeConnectorsProps = OutcomeConnectorsStateProps &
  OutcomeConnectorCommonDispatchProps & {
    outcomes: {
      [actionHash: ActionHashB64]: ComputedOutcome
    }
  }

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
  maybeLinkedOutcome,
  toAddress,
  setOutcomeConnectorFrom,
  setOutcomeConnectorTo,
  connections,
  translate,
  zoomLevel,
  dispatch,
  // specific to this Outcome Connector
  ownExistingParentConnectionAddress,
  presetExistingParentConnectionAddress,
  address,
  outcomeCoordinates,
  outcomeDimensions,
  isCollapsed,
  outcomeActionHashes,
}: OutcomeConnectorProps) => {
  if (!maybeLinkedOutcome) {
    return null
  }
  const { outcomeActionHash: fromAddress, relation } = maybeLinkedOutcome

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
    (address === fromAddress && relation === ExistingOutcomeAsChild) ||
    (toAddress && address === toAddress && relation === ExistingOutcomeAsParent)
  const bottomConnectorActive =
    (address === fromAddress && relation === ExistingOutcomeAsParent) ||
    (toAddress && address === toAddress && relation === ExistingOutcomeAsChild)

  // a connection to this upper port would make this Outcome a child of the
  // current 'from' Outcome of the connection connector
  // if there is one
  const canShowTopConnector =
    !bottomConnectorActive &&
    (!relation || relation === ExistingOutcomeAsParent)

  // a connection to this lower port would make this Outcome a parent of the current 'from' Outcome of the connection connector
  // if there is one
  const canShowBottomConnector =
    !topConnectorActive &&
    (!relation || relation === ExistingOutcomeAsChild) &&
    !isCollapsed

  // generalized mouse down handler
  const connectionConnectMouseDown = (
    direction: RelationInput,
    validity: typeof calculateValidParents
  ) => (event: React.MouseEvent) => {
    if (!fromAddress) {
      // if the action is being performed from
      // a top port, then there's two options:
      // 1. if shiftKey is held, then allow multi-parenting
      // 2. if not, then override any existing connection (re-parent)
      // if the action is a bottom port, then
      // definitely don't override any existing connection
      // ASSUMPTION: one parent
      const connectionAddressToOverride =
        direction === ExistingOutcomeAsChild && !event.shiftKey
          ? ownExistingParentConnectionAddress
          : undefined
      setOutcomeConnectorFrom({
        maybeLinkedOutcome: {
          outcomeActionHash: address,
          relation: direction,
          siblingOrder: 0, // TODO?
        },
        existingParentConnectionAddress: connectionAddressToOverride,
        validToAddresses: validity(address, connections, outcomeActionHashes),
      })
    }
  }

  // mouse up handler
  const connectionConnectMouseUp = () => {
    handleConnectionConnectMouseUp(
      maybeLinkedOutcome,
      toAddress,
      presetExistingParentConnectionAddress,
      activeProject,
      dispatch
    )
  }
  // spefific mousedown handlers
  const topConnectorOnMouseDown = connectionConnectMouseDown(
    ExistingOutcomeAsChild,
    calculateValidParents
  )
  const bottomConnectorOnMouseDown = connectionConnectMouseDown(
    ExistingOutcomeAsParent,
    calculateValidChildren
  )
  // mouseovers
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
  maybeLinkedOutcome,
  toAddress,
  existingParentConnectionAddress,
  connectorAddresses,
  collapsedOutcomes,
  setOutcomeConnectorFrom,
  setOutcomeConnectorTo,
  dispatch,
}: OutcomeConnectorsProps) => {
  // convert from object to array
  const outcomeActionHashes = Object.keys(outcomes)
  return (
    <>
      {connectorAddresses.map((connectorAddress) => {
        const outcomeCoordinates = coordinates[connectorAddress]
        const outcomeDimensions = dimensions[connectorAddress]
        const isCollapsed = collapsedOutcomes[connectorAddress]
        // look for an existing connection that defines a parent
        // of this Outcome, so that it can be deleted
        // if it is to be changed and a new one added
        // ONLY do this if there is only one parent
        const parents = connections.filter(
          (connection) => connection.childActionHash === connectorAddress
        )
        const singularParent = parents.length === 1 ? parents[0] : undefined
        return (
          <div key={connectorAddress}>
            {outcomeCoordinates && outcomeDimensions && (
              <OutcomeConnector
                activeProject={activeProject}
                connections={connections}
                outcomeActionHashes={outcomeActionHashes}
                maybeLinkedOutcome={maybeLinkedOutcome}
                toAddress={toAddress}
                ownExistingParentConnectionAddress={
                  singularParent && singularParent.actionHash
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
      })}
    </>
  )
}
export default OutcomeConnectors
