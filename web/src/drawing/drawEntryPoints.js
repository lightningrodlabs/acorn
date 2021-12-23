import { fontFamily } from './dimensions'
import drawRoundCornerRectangle from './drawRoundCornerRectangle'
import { getBoundingRec } from './layoutFormula'

export default function drawEntryPoints(
  ctx,
  activeEntryPoints,
  goals,
  edgesAsArray,
  coordinates
) {
  // recursively calls itself
  // so that it constructs the full sub-tree for each root Goal
  function getGoal(goalAddress) {
    return {
      ...goals[goalAddress],
      children: edgesAsArray
        // find the edges indicating the children of this goal
        .filter(edge => edge.parent_address === goalAddress)
        // actually nest the children Goals, recurse
        .map(edge => getGoal(edge.child_address))
    }
  }

  // start with the entry point Goals, and recurse down to their children
  activeEntryPoints.forEach(entryPoint => {
    const goal = getGoal(entryPoint.goal_address)
    // for each goalTree
    // calculate its bounding rectangle
    // by checking the coordinates recursively for it and all its children
    const boundingRec = getBoundingRec(goal, coordinates)
    if (!boundingRec) {
      return
    }
    const [top, right, bottom, left] = boundingRec

    ctx.save()
    ctx.setLineDash([5, 3]) /*dashes are 5px and spaces are 3px*/
    const width = right - left
    const height = bottom - top
    drawRoundCornerRectangle({
      context: ctx,
      xPosition: left,
      yPosition: top,
      width: width,
      height: height,
      radius: 15,
      color: entryPoint.color,
      stroke: true,
      strokeWidth: 2,
      boxShadow: false
    })
    ctx.fillStyle = entryPoint.color
    ctx.font = '25px ' + 'PlusJakartaSans-bold'
    // distance of entry point title from dotted rectangle
    let content = goal.content.length < 40 ? goal.content : goal.content.slice(0, 40) + '...'
    ctx.fillText(content, left, top - 20)
    ctx.restore()
  })
}
