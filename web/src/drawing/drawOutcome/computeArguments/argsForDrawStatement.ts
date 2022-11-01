import {
  STATEMENT_FONT_COLOR,
  STATEMENT_PLACEHOLDER_COLOR,
} from '../../../styles'
import { ComputedOutcome, ComputedScope } from '../../../types'
import {
  outcomePaddingHorizontal,
  OUTCOME_STATEMENT_PLACEHOLDER_LINE_HEIGHT_NOT_SMALL,
  OUTCOME_STATEMENT_PLACEHOLDER_LINE_HEIGHT_SMALL,
  OUTCOME_STATEMENT_PLACEHOLDER_LINE_SPACE_NOT_SMALL,
  OUTCOME_STATEMENT_PLACEHOLDER_LINE_SPACE_SMALL,
} from '../../dimensions'
import drawStatement from '../drawStatement'

export const argsForDrawStatement = ({
  useLineLimit,
  noStatementPlaceholder,
  skipRender,
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
  noStatementPlaceholder?: boolean
  skipRender?: boolean
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

  // if noStatementPlaceholder then definitely
  // don't set a placeholder
  const statementPlaceholder = noStatementPlaceholder
    ? false
    : outcome
    ? (outcome.computedScope === ComputedScope.Small && zoomLevel <= 0.5) ||
      (outcome.computedScope !== ComputedScope.Small && zoomLevel <= 0.25)
    : false

  skipRender =
    skipRender ||
    (outcome
      ? outcome.computedScope === ComputedScope.Small && zoomLevel <= 0.3
      : false)

  // statement placeholder line heights depending on outcome scope
  const statementPlaceholderHeight = outcome
    ? outcome.computedScope === ComputedScope.Small
      ? OUTCOME_STATEMENT_PLACEHOLDER_LINE_HEIGHT_SMALL
      : OUTCOME_STATEMENT_PLACEHOLDER_LINE_HEIGHT_NOT_SMALL
    : OUTCOME_STATEMENT_PLACEHOLDER_LINE_HEIGHT_NOT_SMALL

  // statement placeholder line spaces depending on outcome scope
  const statementPlaceholderLineSpace = outcome
    ? outcome.computedScope === ComputedScope.Small
      ? OUTCOME_STATEMENT_PLACEHOLDER_LINE_SPACE_SMALL
      : OUTCOME_STATEMENT_PLACEHOLDER_LINE_SPACE_NOT_SMALL
    : OUTCOME_STATEMENT_PLACEHOLDER_LINE_SPACE_NOT_SMALL

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
    statementPlaceholderHeight,
    statementPlaceholderLineSpace,
    statementPlaceholderColor: STATEMENT_PLACEHOLDER_COLOR,
  }
  return args
}
