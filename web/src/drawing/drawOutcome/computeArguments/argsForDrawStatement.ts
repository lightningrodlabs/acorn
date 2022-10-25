import {
  STATEMENT_FONT_COLOR,
  STATEMENT_PLACEHOLDER_COLOR,
} from '../../../styles'
import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../../../types'
import {
  DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT,
  outcomePaddingHorizontal,
  OUTCOME_VERTICAL_SPACE_BETWEEN,
} from '../../dimensions'
import drawStatement from '../drawStatement'

export const argsForDrawStatement = ({
  useLineLimit,
  onlyMeasure,
  outcome,
  outcomeLeftX,
  outcomeTopY,
  outcomeWidth,
  topOffsetY,
  zoomLevel,
  ctx,
}: {
  useLineLimit: boolean
  onlyMeasure?: boolean
  outcome: ComputedOutcome
  outcomeLeftX: number
  outcomeTopY: number
  outcomeWidth: number
  topOffsetY: number
  zoomLevel: number
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawStatement>[0] => {
  const xPosition = outcomeLeftX + outcomePaddingHorizontal
  const yPosition = outcomeTopY + topOffsetY

  const width = outcomeWidth - 2 * outcomePaddingHorizontal

  const statement = outcome ? outcome.content : ''

  const statementPlaceholder = outcome
    ? outcome.computedScope === ComputedScope.Small && zoomLevel <= 0.5
    : false

  const skipRender = outcome
    ? outcome.computedScope === ComputedScope.Small && zoomLevel <= 0.3
    : false

  const args: Parameters<typeof drawStatement>[0] = {
    skipRender,
    useLineLimit,
    onlyMeasure,
    xPosition,
    yPosition,
    zoomLevel,
    width,
    statement,
    color: STATEMENT_FONT_COLOR,
    ctx,
    statementPlaceholder,
    statementPlaceholderColor: STATEMENT_PLACEHOLDER_COLOR,
  }
  return args
}
