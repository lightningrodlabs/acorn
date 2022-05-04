import { outcomeWidth, getOutcomeHeight } from './dimensions'
import { SELECTED_COLOR } from '../styles'

export function calculateConnectionCoordsByOutcomeCoords(
  childCoords,
  parentCoords,
  outcome,
  projectTags,
  zoomLevel, // number
  ctx
) {
  const parentOutcomeHeight = getOutcomeHeight({
    ctx,
    outcome,
    projectTags,
    width: outcomeWidth,
    zoomLevel,
  })
  const childConnectionCoords = {
    x: childCoords.x + outcomeWidth / 2,
    y: childCoords.y,
  }
  const parentConnectionCoords = {
    x: parentCoords.x + outcomeWidth / 2,
    y: parentCoords.y + parentOutcomeHeight,
  }
  return [childConnectionCoords, parentConnectionCoords]
}

export default function render(
  connection1port,
  connection2port,
  ctx,
  isHovered,
  isSelected
) {
  if (isHovered) {
    ctx.save()
    ctx.beginPath()
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)'
    ctx.moveTo(connection1port.x, connection1port.y)
    ctx.lineTo(connection2port.x, connection2port.y)
    ctx.stroke()
    ctx.restore()
  }

  ctx.save()
  ctx.beginPath()
  ctx.lineCap = 'round'
  ctx.lineWidth = isSelected ? 3 : 2
  ctx.strokeStyle = isSelected ? SELECTED_COLOR : '#E3DDCC'
  ctx.moveTo(connection1port.x, connection1port.y)
  ctx.lineTo(connection2port.x, connection2port.y)
  ctx.stroke()
  ctx.restore()

  // TODO: draw the arrow at the end of the connection
  // will require some trigonometry
}
