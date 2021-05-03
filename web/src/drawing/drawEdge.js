import { goalWidth, getGoalHeight } from './dimensions'
import { selectedColor } from '../styles'

export function calculateEdgeCoordsByGoalCoords(
  childCoords,
  parentCoords,
  parentGoalText,
  ctx
) {
  const parentGoalHeight = getGoalHeight(ctx, parentGoalText)
  const childEdgeCoords = {
    x: childCoords.x + goalWidth / 2,
    y: childCoords.y,
  }
  const parentEdgeCoords = {
    x: parentCoords.x + goalWidth / 2,
    y: parentCoords.y + parentGoalHeight,
  }
  return [childEdgeCoords, parentEdgeCoords]
}

export default function render(
  edge1port,
  edge2port,
  ctx,
  isHovered,
  isSelected
) {
  if (isHovered) {
    ctx.save()
    ctx.beginPath()
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)'
    ctx.moveTo(edge1port.x, edge1port.y)
    ctx.lineTo(edge2port.x, edge2port.y)
    ctx.stroke()
    ctx.restore()
  }

  ctx.save()
  ctx.beginPath()
  ctx.lineCap = 'round'
  ctx.lineWidth = isSelected ? 2 : 1
  ctx.strokeStyle = isSelected ? selectedColor : '#707070'
  ctx.moveTo(edge1port.x, edge1port.y)
  ctx.lineTo(edge2port.x, edge2port.y)
  ctx.stroke()
  ctx.restore()

  // TODO: draw the arrow at the end of the edge
  // will require some trigonometry
}
