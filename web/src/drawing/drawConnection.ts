import { getOutcomeWidth, getOutcomeHeight } from './dimensions'
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
  childOutcomeWidth: number,
  parentOutcome: ComputedOutcome,
  projectTags: WithActionHash<Tag>[],
  zoomLevel: number,
  ctx: CanvasRenderingContext2D
) {
  const parentOutcomeWidth = getOutcomeWidth({
    outcome: parentOutcome,
    zoomLevel,
  })
  const parentOutcomeHeight = getOutcomeHeight({
    ctx,
    outcome: parentOutcome,
    projectTags,
    width: parentOutcomeWidth,
    zoomLevel,
  })
  const childConnectionCoords = {
    x: childCoords.x + childOutcomeWidth / 2,
    y: childCoords.y,
  }
  const parentConnectionCoords = {
    x: parentCoords.x + parentOutcomeWidth / 2,
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
  zoomLevel,
}: {
  connection1port: { x: number; y: number }
  connection2port: { x: number; y: number }
  ctx: CanvasRenderingContext2D
  isAchieved: boolean
  isHovered: boolean
  isSelected: boolean
  zoomLevel: number
}) {
  draw(ctx, () => {
    ctx.lineCap = 'round'

    const DEFAULT_WIDTH = 3 // (at 100 %)
    // 0.02 < zoomLevel < 2.5
    // dont go lower than the DEFAULT_WIDTH, but go higher as the
    // zoomLevel drops
    let lineWidth = Math.max(DEFAULT_WIDTH, (DEFAULT_WIDTH / zoomLevel) * 0.4)
    // isHovered adjust
    // isSelected adjust
    ctx.lineWidth = lineWidth
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
