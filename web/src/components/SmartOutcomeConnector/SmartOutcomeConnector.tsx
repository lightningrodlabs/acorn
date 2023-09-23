import React from 'react'
import { CONNECTOR_VERTICAL_SPACING } from '../../drawing/dimensions'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import handleConnectionConnectMouseUp from '../../redux/ephemeral/outcome-connector/handler'
import { calculateValidChildren, calculateValidParents } from '../../tree-logic'
import { Connection, LinkedOutcomeDetails, RelationInput } from '../../types'
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
import OutcomeConnector from '../OutcomeConnector/OutcomeConnector'
import './SmartOutcomeConnector.scss'
import { lowerThanLowestSiblingOrder } from '../../connections'

const { ExistingOutcomeAsChild, ExistingOutcomeAsParent } = RelationInput

export type SmartOutcomeConnectorStateProps = {
  activeProject: CellIdString
  translate: ViewportState['translate']
  zoomLevel: ViewportState['scale']
  connections: WithActionHash<Connection>[]
  outcomeConnectorMaybeLinkedOutcome: Option<LinkedOutcomeDetails>
  toAddress: ActionHashB64
  allOutcomeActionHashes: ActionHashB64[]
}

export type SmartOutcomeConnectorDispatchProps = {
  setOutcomeConnectorFrom: (payload: OutcomeConnectorFromPayload) => void
  setOutcomeConnectorTo: (address: ActionHashB64) => void
  dispatch: any
}

export type SmartOutcomeConnectorProps = SmartOutcomeConnectorStateProps &
  SmartOutcomeConnectorDispatchProps & {
    ownExistingParentConnectionAddress: ActionHashB64
    presetExistingParentConnectionAddress: ActionHashB64
    outcomeAddress: ActionHashB64
    outcomeCoordinates: CoordinatesState[ActionHashB64]
    outcomeDimensions: DimensionsState[ActionHashB64]
    isCollapsed: boolean
  }

const SmartOutcomeConnector: React.FC<SmartOutcomeConnectorProps> = ({
  activeProject,
  // outcomeConnectorMaybeLinkedOutcome indicates
  // that a Connection is actively already in the process
  // of being made
  outcomeConnectorMaybeLinkedOutcome,
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
  outcomeAddress,
  outcomeCoordinates,
  outcomeDimensions,
  isCollapsed,
  allOutcomeActionHashes,
}) => {
  let fromAddress: Option<ActionHashB64> = null
  let relation: Option<RelationInput> = null
  if (outcomeConnectorMaybeLinkedOutcome) {
    fromAddress = outcomeConnectorMaybeLinkedOutcome.outcomeActionHash
    relation = outcomeConnectorMaybeLinkedOutcome.relation
  }

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
    (outcomeAddress === fromAddress && relation === ExistingOutcomeAsChild) ||
    (toAddress &&
      outcomeAddress === toAddress &&
      relation === ExistingOutcomeAsParent)
  const bottomConnectorActive =
    (outcomeAddress === fromAddress && relation === ExistingOutcomeAsParent) ||
    (toAddress &&
      outcomeAddress === toAddress &&
      relation === ExistingOutcomeAsChild)

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
      // IF the action is being performed from
      // a top port, then there's two options:
      // 1. if shiftKey is held, then allow multi-parenting
      // 2. if not, then override any existing connection (re-parent)
      // IF the action is a bottom port, then
      // definitely don't override any existing connection
      const connectionAddressToOverride =
        direction === ExistingOutcomeAsChild && !event.shiftKey
          ? ownExistingParentConnectionAddress
          : undefined
      // when making a new sibling, we want it to go to the far right.
      // we do this by setting a siblingOrder lower than the current lowest
      const siblingOrder = ExistingOutcomeAsParent
        ? lowerThanLowestSiblingOrder({
            connections,
            parentActionHash: outcomeAddress,
          })
        : 0
      setOutcomeConnectorFrom({
        maybeLinkedOutcome: {
          outcomeActionHash: outcomeAddress,
          relation: direction,
          siblingOrder,
        },
        existingParentConnectionAddress: connectionAddressToOverride,
        validToAddresses: validity(
          outcomeAddress,
          connections,
          allOutcomeActionHashes
        ),
      })
    }
  }

  // mouse up handler
  const connectionConnectMouseUp = () => {
    handleConnectionConnectMouseUp(
      outcomeConnectorMaybeLinkedOutcome,
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
    if (fromAddress && outcomeAddress !== fromAddress)
      setOutcomeConnectorTo(outcomeAddress)
  }
  const connectorOnMouseOut = () => {
    setOutcomeConnectorTo(null)
  }

  return (
    <>
      {/* top connector */}
      {(canShowTopConnector || topConnectorActive) && (
        <OutcomeConnector
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
        <OutcomeConnector
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

export default SmartOutcomeConnector
