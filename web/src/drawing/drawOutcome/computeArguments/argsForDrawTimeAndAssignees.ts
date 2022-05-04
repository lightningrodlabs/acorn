import { ComputedOutcome, Profile } from '../../../types'
import {
  AVATAR_INITIALS_TEXT_COLOR,
  AVATAR_STROKE_COLOR,
  TIME_TEXT_COLOR,
} from '../../../styles'
import {
  AVATAR_SIZE,
  AVATAR_SPACE,
  DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT,
  outcomePaddingHorizontal,
  OUTCOME_VERTICAL_SPACE_BETWEEN,
  TIME_FONT_FAMILY,
  TIME_FONT_SIZE_REM,
} from '../../dimensions'
import drawTimeAndAssignees from '../drawTimeAndAssignees'

export const argsForDrawTimeAndAssignees = ({
  onlyMeasure,
  outcome,
  outcomeLeftX,
  outcomeWidth,
  outcomeTopY,
  outcomeStatementHeight,
  outcomeTagsHeight,
  ctx,
}: {
  onlyMeasure: boolean
  outcome: ComputedOutcome
  outcomeLeftX: number
  outcomeTopY: number
  outcomeWidth: number
  outcomeStatementHeight: number
  outcomeTagsHeight: number
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawTimeAndAssignees>[0] => {
  const timeXLeftPosition = outcomeLeftX + outcomePaddingHorizontal

  const assigneesXRightPosition =
    outcomeLeftX + outcomeWidth - outcomePaddingHorizontal

  const verticalSpacing =
    OUTCOME_VERTICAL_SPACE_BETWEEN * 3 +
    // if tags existed, then we need that fourth spacer
    (outcomeTagsHeight > 0 ? OUTCOME_VERTICAL_SPACE_BETWEEN : 0)
  const yPosition =
    outcomeTopY +
    DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT +
    outcomeStatementHeight +
    outcomeTagsHeight +
    verticalSpacing

  const members = outcome.members || []
  const timeEstimate = null
  const fromDate = null
  const toDate = null

  const args: Parameters<typeof drawTimeAndAssignees>[0] = {
    onlyMeasure,
    members,
    timeXLeftPosition,
    assigneesXRightPosition,
    yPosition,
    avatarSize: AVATAR_SIZE,
    avatarSpace: AVATAR_SPACE,
    timeEstimate,
    fromDate,
    toDate,
    timeTextColor: TIME_TEXT_COLOR,
    avatarInitialsTextColor: AVATAR_INITIALS_TEXT_COLOR,
    avatarStrokeColor: AVATAR_STROKE_COLOR,
    timeFontSizeRem: TIME_FONT_SIZE_REM,
    timeFontFamily: TIME_FONT_FAMILY,
    ctx,
  }
  return args
}
