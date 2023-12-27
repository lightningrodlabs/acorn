import { RenderProps } from '../routes/ProjectView/MapView/selectRenderProps'
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
  projectTags,
  zoomLevel,
  outcomeFormMaybeLinkedOutcome,
  outcomeFormContent,
  outcomeFormLeftConnectionX,
  outcomeFormTopConnectionY,
}: {
  ctx: CanvasRenderingContext2D
  coordinates: RenderProps['coordinates']
  allOutcomeDimensions: RenderProps['dimensions']
  projectTags: RenderProps['projectTags']
  zoomLevel: RenderProps['zoomLevel']
  outcomeFormMaybeLinkedOutcome: RenderProps['outcomeFormMaybeLinkedOutcome']
  outcomeFormContent: RenderProps['outcomeFormContent']
  outcomeFormLeftConnectionX: RenderProps['outcomeFormLeftConnectionX']
  outcomeFormTopConnectionY: RenderProps['outcomeFormTopConnectionY']
}) {
  /*
    establish width and height for the card for a 
    new Outcome in the process of being created
    */
  const placeholderOutcomeWithText = getPlaceholderOutcome(outcomeFormContent)
  const newOutcomeWidth = getOutcomeWidth({
    outcome: placeholderOutcomeWithText,
    zoomLevel,
  })
  const newOutcomeHeight = getOutcomeHeight({
    ctx,
    outcome: placeholderOutcomeWithText,
    projectTags,
    width: newOutcomeWidth,
    zoomLevel,
    // we set this because in the case of creating a new outcome
    // it should use the full text at the proper text scaling
    noStatementPlaceholder: true,
    useLineLimit: false,
  })
  const outcomeFormFromActionHash =
    outcomeFormMaybeLinkedOutcome.outcomeActionHash
  const outcomeFormRelation = outcomeFormMaybeLinkedOutcome.relation
  const [
    connection1port,
    connection2port,
  ] = calculateConnectionCoordsByOutcomeCoords(
    coordinates[outcomeFormFromActionHash],
    allOutcomeDimensions[outcomeFormFromActionHash],
    {
      x: outcomeFormLeftConnectionX,
      y: outcomeFormTopConnectionY,
    },
    { width: newOutcomeWidth, height: newOutcomeHeight },
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
