import { fontFamily } from './dimensions'
import roundRect from './drawRoundRect'
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
        .map(edge => getGoal(edge.child_address)),
    }
  }

  // start with the entry point Goals, and recurse down to their children
  activeEntryPoints.forEach(entryPoint => {
    const goal = getGoal(entryPoint.goal_address)
    // for each goalTree
    // calculate its bounding rectangle
    // by checking the coordinates recursively for it and all its children
    const [top, right, bottom, left] = getBoundingRec(goal, coordinates)

    ctx.save()
    ctx.setLineDash([5, 3]) /*dashes are 5px and spaces are 3px*/
    const width = right - left
    const height = bottom - top
    roundRect(ctx, left, top, width, height, 15, entryPoint.color, true, 3)
    ctx.fillStyle = entryPoint.color
    ctx.font = '25px ' + fontFamily
    ctx.fillText(goal.content, left, top - 40)
    ctx.restore()
  })
}
