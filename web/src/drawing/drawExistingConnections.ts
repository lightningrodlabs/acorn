import { Connection } from 'zod-models'
import { ProjectComputedOutcomes } from '../context/ComputedOutcomeContext'
import selectRenderProps, {
  RenderProps,
} from '../routes/ProjectView/MapView/selectRenderProps'
import { RelationInput, ComputedSimpleAchievementStatus } from '../types'
import { ActionHashB64, WithActionHash } from '../types/shared'
import drawConnection, {
  calculateConnectionCoordsByOutcomeCoords,
} from './drawConnection'

// render each connection to the canvas, basing it off the rendering coordinates of the parent and child nodes
export default function drawExistingConnections({
  connectionsAsArray,
  coordinates,
  allOutcomeDimensions,
  hoveredConnectionActionHash,
  selectedConnections,
  zoomLevel,
  ctx,
  outcomes,
  outcomeFormExistingParent,
  outcomeConnectorExistingParent,
  selectedOutcomeActionHash,
}: {
  connectionsAsArray: WithActionHash<Connection>[]
  coordinates: RenderProps['coordinates']
  allOutcomeDimensions: RenderProps['dimensions']
  hoveredConnectionActionHash: RenderProps['hoveredConnectionActionHash']
  selectedConnections: RenderProps['selectedConnections']
  zoomLevel: RenderProps['zoomLevel']
  outcomeFormExistingParent: RenderProps['outcomeFormExistingParent']
  outcomeConnectorExistingParent: RenderProps['outcomeConnectorExistingParent']
  ctx: CanvasRenderingContext2D
  outcomes: ProjectComputedOutcomes['computedOutcomesKeyed']
  selectedOutcomeActionHash: ActionHashB64 | null
}) {
  connectionsAsArray.forEach(function (connection) {
    // if in the pending re-parenting mode for the child card of an existing connection,
    // temporarily omit/hide the existing connection from view
    // ASSUMPTION: one parent
    if (
      connection.actionHash === outcomeFormExistingParent ||
      connection.actionHash === outcomeConnectorExistingParent
    ) {
      // do not draw, because we are pre-representing the
      // fact that this connection will be deleted/replaced
      return
    }

    const childCoords = coordinates[connection.childActionHash]
    const parentCoords = coordinates[connection.parentActionHash]
    const childOutcome = outcomes[connection.childActionHash]
    const parentOutcome = outcomes[connection.parentActionHash]
    // we can only render this connection
    // if we know the coordinates of the Outcomes it connects
    if (childCoords && parentCoords && parentOutcome && childOutcome) {
      const [
        connection1port,
        connection2port,
      ] = calculateConnectionCoordsByOutcomeCoords(
        childCoords,
        allOutcomeDimensions[connection.childActionHash],
        parentCoords,
        allOutcomeDimensions[connection.parentActionHash],
        RelationInput.ExistingOutcomeAsChild
      )
      const isHovered = hoveredConnectionActionHash === connection.actionHash

      const isSelected = selectedConnections.includes(connection.actionHash)

      // highlight the existing connections for a selected outcome
      const connectionForSelectedOutcome = selectedOutcomeActionHash
        ? selectedOutcomeActionHash === connection.childActionHash ||
          selectedOutcomeActionHash === connection.parentActionHash
        : false
      drawConnection({
        connection1port,
        connection2port,
        ctx,
        isAchieved:
          childOutcome.computedAchievementStatus.simple ===
          ComputedSimpleAchievementStatus.Achieved,
        isHovered,
        isSelected,
        connectionForSelectedOutcome,
        zoomLevel,
      })
    }
  })
}
