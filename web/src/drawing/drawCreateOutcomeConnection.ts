import { RenderProps } from '../routes/ProjectView/MapView/selectRenderProps'
import { coordsCanvasToPage, coordsPageToCanvas } from './coordinateSystems'
import { getOutcomeWidth, getOutcomeHeight } from './dimensions'
import drawConnection, {
  calculateConnectionCoordsByOutcomeCoords,
} from './drawConnection'
import { getPlaceholderOutcome } from './drawOutcome/placeholderOutcome'

/*
DRAW PENDING CONNECTION FOR OUTCOME FORM
*/
// render the Connection that is pending to be created to an open Outcome
// creation form
export default function drawCreateOutcomeConnection({
  ctx,
  coordinates,
  allOutcomeDimensions,
  zoomLevel,
  translate,
  outcomeFormMaybeLinkedOutcome,
  outcomeFormLeftConnectionX,
  outcomeFormTopConnectionY,
}: {
  ctx: CanvasRenderingContext2D
  coordinates: RenderProps['coordinates']
  allOutcomeDimensions: RenderProps['dimensions']
  zoomLevel: RenderProps['zoomLevel']
  translate: RenderProps['translate']
  outcomeFormMaybeLinkedOutcome: RenderProps['outcomeFormMaybeLinkedOutcome']
  outcomeFormLeftConnectionX: RenderProps['outcomeFormLeftConnectionX']
  outcomeFormTopConnectionY: RenderProps['outcomeFormTopConnectionY']
}) {
  const outcomeFormFromActionHash =
    outcomeFormMaybeLinkedOutcome.outcomeActionHash
  const outcomeFormRelation = outcomeFormMaybeLinkedOutcome.relation
  const sourceCoordinates = coordinates[outcomeFormFromActionHash]
  const sourceDimensions = allOutcomeDimensions[outcomeFormFromActionHash]
  const destinationCoordinates = {
    x: outcomeFormLeftConnectionX,
    y: outcomeFormTopConnectionY,
  }
  const pixelWidth = 384
  const pixelHeight = 205
  const destinationPageCoords = coordsCanvasToPage(destinationCoordinates, translate, zoomLevel)
  // overflowX situation
  if (destinationPageCoords.x + pixelWidth > window.innerWidth) {
    const adjustBy = destinationPageCoords.x + pixelWidth - window.innerWidth
    destinationCoordinates.x -= coordsPageToCanvas({ x: adjustBy, y: 0 }, { x: 0, y: 0 }, zoomLevel).x
  }
  // overflowY situation
  if (destinationPageCoords.y + pixelHeight > window.innerHeight) {
    const adjustBy = destinationPageCoords.y + pixelHeight - window.innerHeight
    destinationCoordinates.y -= coordsPageToCanvas({ x: 0, y: adjustBy }, { x: 0, y: 0 }, zoomLevel).y
  }
  // convert the height of the card which is measured in pixels into
  // the height of the card measured in canvas units
  const createOutcomeCardCanvasWidthAndHeight = coordsPageToCanvas({ x: pixelWidth, y: pixelHeight }, { x: 0, y: 0 }, zoomLevel)
  const destinationDimensions = {
    width: createOutcomeCardCanvasWidthAndHeight.x,
    height: createOutcomeCardCanvasWidthAndHeight.y,
  }
  const [
    connection1port,
    connection2port,
  ] = calculateConnectionCoordsByOutcomeCoords(
    sourceCoordinates,
    sourceDimensions,
    destinationCoordinates,
    destinationDimensions,
    outcomeFormRelation
  )

  drawConnection({
    connection1port,
    connection2port,
    ctx,
    isAchieved: false,
    isSelected: false,
    isHovered: false,
    zoomLevel,
  })
}
