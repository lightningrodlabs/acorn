import { ActionHashB64 } from '@holochain/client'
import { RenderProps } from '../routes/ProjectView/MapView/selectRenderProps'
import drawConnection, {
  calculateConnectionCoordsByOutcomeCoords,
} from './drawConnection'

/*
    DRAW PENDING CONNECTION FOR "CONNECTION CONNECTOR"
*/
// render the connection that is pending to be created between existing Outcomes
// if there's an Outcome this is pending
// as being "to", then we will be drawing the connection to its correct
// upper or lower port
// the opposite of whichever the "from" port is connected to
export default function drawConnectionConnector({
  ctx,
  coordinates,
  allOutcomeDimensions,
  mouseLiveCoordinate,
  zoomLevel,
  outcomeConnectorMaybeLinkedOutcome,
  outcomeConnectorToAddress,
}: {
  ctx: CanvasRenderingContext2D
  coordinates: RenderProps['coordinates']
  allOutcomeDimensions: RenderProps['dimensions']
  mouseLiveCoordinate: RenderProps['mouseLiveCoordinate']
  zoomLevel: RenderProps['zoomLevel']
  outcomeConnectorMaybeLinkedOutcome: RenderProps['outcomeConnectorMaybeLinkedOutcome']
  outcomeConnectorToAddress?: ActionHashB64
}) {
  const outcomeConnectorFromAddress =
    outcomeConnectorMaybeLinkedOutcome.outcomeActionHash
  const outcomeConnectorRelation = outcomeConnectorMaybeLinkedOutcome.relation
  const fromCoords = coordinates[outcomeConnectorFromAddress]
  const [childCoords, parentCoords] = calculateConnectionCoordsByOutcomeCoords(
    fromCoords,
    allOutcomeDimensions[outcomeConnectorFromAddress],
    // use the current mouse coordinate position, liveCoordinate, by default
    outcomeConnectorToAddress
      ? coordinates[outcomeConnectorToAddress]
      : mouseLiveCoordinate,
    outcomeConnectorToAddress
      ? allOutcomeDimensions[outcomeConnectorToAddress]
      : { width: 0, height: 0 },
    outcomeConnectorRelation
  )
  // in drawConnection, it draws at exactly the two coordinates given,
  // so we could pass them in either order/position
  drawConnection({
    connection1port: childCoords,
    connection2port: parentCoords,
    ctx,
    isAchieved: false,
    isHovered: false,
    isSelected: false,
    zoomLevel,
  })
}
