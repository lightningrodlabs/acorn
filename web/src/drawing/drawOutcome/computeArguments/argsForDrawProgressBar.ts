import { computeProgress } from '../../../redux/persistent/projects/outcomes/computedState'
import {
  PROGRESS_BAR_FOREGROUND_COLOR,
  PROGRESS_BAR_BACKGROUND_COLOR,
} from '../../../styles'
import { ComputedOutcome, ComputedScope } from '../../../types'
import { outcomePaddingHorizontal, PROGRESS_BAR_HEIGHT } from '../../dimensions'
import drawProgressBar from '../drawProgressBar'

export const argsForDrawProgressBar = ({
  onlyMeasure,
  zoomLevel,
  outcome,
  outcomeLeftX,
  outcomeTopY,
  topOffsetY,
  outcomeWidth,
  ctx,
}: {
  onlyMeasure?: boolean
  outcome: ComputedOutcome
  zoomLevel: number
  outcomeLeftX: number
  outcomeTopY: number
  topOffsetY: number
  outcomeWidth: number
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawProgressBar>[0] => {
  const xPosition = outcomeLeftX + outcomePaddingHorizontal
  const width = outcomeWidth - outcomePaddingHorizontal * 2

  const yPosition = outcomeTopY + topOffsetY

  const progress = computeProgress(outcome)

  const skipRender = outcome
    ? outcome.computedScope === ComputedScope.Small && zoomLevel <= 0.5
    : false

  const args: Parameters<typeof drawProgressBar>[0] = {
    ctx,
    xPosition,
    yPosition,
    width,
    height: PROGRESS_BAR_HEIGHT,
    progress,
    backgroundColor: PROGRESS_BAR_BACKGROUND_COLOR,
    foregroundColor: PROGRESS_BAR_FOREGROUND_COLOR,
    skipRender,
    onlyMeasure,
  }
  return args
}
