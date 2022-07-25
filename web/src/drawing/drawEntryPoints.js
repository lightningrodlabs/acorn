import drawRoundCornerRectangle from './drawRoundCornerRectangle'
import { getBoundingRec } from './layoutFormula'

export default function drawEntryPoints(
  ctx,
  activeEntryPoints,
  outcomes,
  connectionsAsArray,
  coordinates,
  zoomLevel,
  projectTags
) {
  // recursively calls itself
  // so that it constructs the full sub-tree for each root Outcome
  function getOutcome(outcomeActionHash) {
    return {
      ...outcomes[outcomeActionHash],
      children: connectionsAsArray
        // find the connections indicating the children of this outcome
        .filter(
          (connection) => connection.parentActionHash === outcomeActionHash
        )
        // actually nest the children Outcomes, recurse
        .map((connection) => getOutcome(connection.childActionHash)),
    }
  }

  // start with the entry point Outcomes, and recurse down to their children
  activeEntryPoints.forEach((entryPoint) => {
    const outcome = getOutcome(entryPoint.outcomeActionHash)
    // for each outcomeTree
    // calculate its bounding rectangle
    // by checking the coordinates recursively for it and all its children
    const boundingRec = getBoundingRec(
      outcome,
      zoomLevel,
      ctx,
      projectTags,
      coordinates
    )
    if (!boundingRec) {
      return
    }
    const [top, right, bottom, left] = boundingRec

    ctx.save()
    ctx.setLineDash([10, 7]) /*dashes are 10px and spaces are 7px*/
    ctx.lineCap = "round"
    const width = right - left
    const height = bottom - top
    drawRoundCornerRectangle({
      ctx,
      xPosition: left,
      yPosition: top,
      width: width,
      height: height,
      radius: 15,
      color: entryPoint.color,
      useStroke: true,
      strokeWidth: 5,
      useBoxShadow: false,
      useGlow: false,
    })
    ctx.fillStyle = entryPoint.color
    ctx.font = '25px ' + 'PlusJakartaSans-bold'
    // distance of entry point title from dotted rectangle
    let content =
      outcome.content.length < 40
        ? outcome.content
        : outcome.content.slice(0, 40) + '...'
    ctx.fillText(content, left, top - 36)
    ctx.restore()
  })
}
