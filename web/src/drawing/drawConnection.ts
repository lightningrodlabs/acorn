import { outcomeWidth, getOutcomeHeight } from './dimensions'
import {
  CONNECTION_ACHIEVED_COLOR,
  CONNECTION_NOT_ACHIEVED_COLOR,
  SELECTED_COLOR,
} from '../styles'
import draw from './draw'
import { WithActionHash } from '../types/shared'
import { ComputedOutcome, Tag } from '../types'

export function calculateConnectionCoordsByOutcomeCoords(
  childCoords: { x: number; y: number },
  parentCoords: { x: number; y: number },
  outcome: ComputedOutcome,
  projectTags: WithActionHash<Tag>[],
  zoomLevel: number,
  ctx: CanvasRenderingContext2D
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

const pathForConnection = ({
  fromPoint,
  toPoint,
}: {
  fromPoint: { x: number; y: number }
  toPoint: { x: number; y: number }
}) => {
  const path = new Path2D()
  path.moveTo(fromPoint.x, fromPoint.y)
  const halfwayY = (fromPoint.y + toPoint.y) / 2
  path.bezierCurveTo(
    fromPoint.x,
    halfwayY,
    toPoint.x,
    halfwayY + 50,
    toPoint.x,
    toPoint.y
  )
  return path
}

export { pathForConnection }

export default function render({
  connection1port,
  connection2port,
  ctx,
  isAchieved,
  isHovered,
  isSelected,
}: {
  connection1port: { x: number; y: number }
  connection2port: { x: number; y: number }
  ctx: CanvasRenderingContext2D
  isAchieved: boolean
  isHovered: boolean
  isSelected: boolean
}) {
  draw(ctx, () => {
    ctx.lineCap = 'round'
    ctx.lineWidth = isHovered ? 5 : isSelected ? 4 : 3
    ctx.strokeStyle = isSelected
      ? SELECTED_COLOR
      : isAchieved
      ? CONNECTION_ACHIEVED_COLOR
      : CONNECTION_NOT_ACHIEVED_COLOR
    const bezierCurvePath = pathForConnection({
      fromPoint: connection1port,
      toPoint: connection2port,
    })
    ctx.stroke(bezierCurvePath)
  })
}
