import { ComputedOutcome, ComputedScope } from '../../../types'
import {
  AVATAR_INITIALS_TEXT_COLOR,
  AVATAR_STROKE_COLOR,
  TIME_ASSIGNEES_PLACEHOLDER_COLOR,
  TIME_TEXT_COLOR,
} from '../../../styles'
import {
  AVATAR_SIZE,
  AVATAR_SPACE,
  AVATAR_FONT_SIZE_REM,
  AVATAR_FONT_FAMILY,
  outcomePaddingHorizontal,
  TIME_FONT_FAMILY,
  TIME_FONT_SIZE_REM,
} from '../../dimensions'
import drawTimeAndAssignees from '../drawTimeAndAssignees'

export const argsForDrawTimeAndAssignees = ({
  onlyMeasure = false,
  outcome,
  outcomeLeftX,
  outcomeWidth,
  outcomeTopY,
  topOffsetY,
  zoomLevel,
  ctx,
}: {
  onlyMeasure?: boolean
  outcome: ComputedOutcome
  outcomeLeftX: number
  outcomeTopY: number
  topOffsetY: number
  outcomeWidth: number
  zoomLevel: number
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawTimeAndAssignees>[0] => {
  const timeXLeftPosition = outcomeLeftX + outcomePaddingHorizontal

  const assigneesXRightPosition =
    outcomeLeftX + outcomeWidth - outcomePaddingHorizontal

  const yPosition = outcomeTopY + topOffsetY

  const members = outcome.members || []
  const timeEstimate = null
  const fromDate = null
  const toDate = null

  // the same as statement and the other content
  const maxWidth = outcomeWidth - 2 * outcomePaddingHorizontal

  const timeAndAssigneesPlaceholder = outcome
    ? outcome.computedScope === ComputedScope.Small && zoomLevel <= 0.5
    : false

  const args: Parameters<typeof drawTimeAndAssignees>[0] = {
    onlyMeasure,
    members,
    timeXLeftPosition,
    assigneesXRightPosition,
    yPosition,
    avatarSize: AVATAR_SIZE,
    avatarSpace: AVATAR_SPACE,
    avatarFontSizeRem: AVATAR_FONT_SIZE_REM,
    avatarFontFamily: AVATAR_FONT_FAMILY,
    timeEstimate,
    fromDate,
    toDate,
    timeTextColor: TIME_TEXT_COLOR,
    avatarInitialsTextColor: AVATAR_INITIALS_TEXT_COLOR,
    avatarStrokeColor: AVATAR_STROKE_COLOR,
    timeFontSizeRem: TIME_FONT_SIZE_REM,
    timeFontFamily: TIME_FONT_FAMILY,
    timeAndAssigneesPlaceholder,
    timeAndAssigneesPlaceholderColor: TIME_ASSIGNEES_PLACEHOLDER_COLOR,
    maxWidth,
    ctx,
  }
  return args
}
