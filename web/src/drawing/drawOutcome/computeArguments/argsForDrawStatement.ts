import { STATEMENT_FONT_COLOR } from '../../../styles'
import { ComputedOutcome } from '../../../types'
import {
  DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT,
  outcomePaddingHorizontal,
  OUTCOME_VERTICAL_SPACE_BETWEEN,
} from '../../dimensions'
import drawStatement from '../drawStatement'

export const argsForDrawStatement = ({
  outcome,
  outcomeLeftX,
  outcomeTopY,
  outcomeWidth,
  zoomLevel,
  ctx,
}: {
  outcome: ComputedOutcome
  outcomeLeftX: number
  outcomeTopY: number
  outcomeWidth: number
  zoomLevel: number
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawStatement>[0] => {
  const xPosition = outcomeLeftX + outcomePaddingHorizontal
  const yPosition =
    outcomeTopY +
    OUTCOME_VERTICAL_SPACE_BETWEEN * 2 +
    DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT
  const width = outcomeWidth - 2 * outcomePaddingHorizontal
  const args: Parameters<typeof drawStatement>[0] = {
    xPosition,
    yPosition,
    zoomLevel,
    width,
    statement: outcome.content,
    color: STATEMENT_FONT_COLOR,
    ctx,
  }
  return args
}
