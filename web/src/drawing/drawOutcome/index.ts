import { ComputedOutcome, Tag } from '../../types'
import { WithActionHash } from '../../types/shared'
import draw from '../draw'
import {
  argsForDrawBackgroundColor,
  argsForDrawBeingEdited,
  argsForDrawColoredBorder,
  argsForDrawDescendantsAchievementStatus,
  argsForDrawGlow,
  argsForDrawPeopleActive,
  argsForDrawProgressBar,
  argsForDrawSelectedBorder,
  argsForDrawSmallLeaf,
  argsForDrawStatement,
  argsForDrawTags,
  argsForDrawTimeAndAssignees,
} from './computeArguments'
import drawBackgroundColor from './drawBackgroundColor'
import drawBeingEdited from './drawBeingEdited'
import drawColoredBorder from './drawColoredBorder'
import drawDescendantsAchievementStatus from './drawDescendantsAchievementStatus'
import drawGlow from './drawGlow'
import drawPeopleActive from './drawPeopleActive'
import drawProgressBar from './drawProgressBar'
import drawSelectedBorder from './drawSelectedBorder'
import drawSmallLeaf from './drawSmallLeaf'
import drawStatement from './drawStatement'
import drawTags from './drawTags'
import drawTimeAndAssignees from './drawTimeAndAssignees'

const drawOutcome = ({
  outcome,
  outcomeLeftX,
  outcomeTopY,
  outcomeHeight,
  outcomeWidth,
  projectTags,
  // variants
  useLineLimit,
  zoomLevel,
  isTopPriority,
  isSelected,
  // canvas context
  ctx,
}: {
  outcome: ComputedOutcome
  outcomeLeftX: number
  outcomeTopY: number
  outcomeHeight: number
  outcomeWidth: number
  projectTags: WithActionHash<Tag>[]
  // variants
  useLineLimit: boolean
  zoomLevel: number
  isTopPriority: boolean
  isSelected: boolean
  ctx: CanvasRenderingContext2D
}) =>
  draw(ctx, () => {
    drawSelectedBorder(
      argsForDrawSelectedBorder({
        ctx,
        outcomeLeftX,
        outcomeTopY,
        outcomeHeight,
        outcomeWidth,
        isSelected,
      })
    )
    drawGlow(
      argsForDrawGlow({
        outcomeLeftX,
        outcomeTopY,
        outcomeWidth,
        outcomeHeight,
        ctx,
        useGlow: isTopPriority,
      })
    )
    drawBackgroundColor(
      argsForDrawBackgroundColor({
        outcome,
        outcomeLeftX,
        outcomeTopY,
        outcomeWidth,
        outcomeHeight,
        ctx,
      })
    )
    drawColoredBorder(
      argsForDrawColoredBorder({
        outcome,
        outcomeLeftX,
        outcomeTopY,
        outcomeWidth,
        outcomeHeight,
        ctx,
      })
    )
    drawSmallLeaf(
      argsForDrawSmallLeaf({
        outcome,
        outcomeLeftX,
        outcomeTopY,
        outcomeWidth,
        ctx,
      })
    )
    drawDescendantsAchievementStatus(
      argsForDrawDescendantsAchievementStatus({
        outcome,
        outcomeLeftX,
        outcomeTopY,
        ctx,
      })
    )
    const heightOfStatement = drawStatement(
      argsForDrawStatement({
        useLineLimit,
        outcome,
        outcomeLeftX,
        outcomeTopY,
        outcomeWidth,
        zoomLevel,
        ctx,
      })
    )
    const heightOfTags = drawTags(
      argsForDrawTags({
        outcome,
        outcomeLeftX,
        outcomeTopY,
        outcomeWidth,
        heightOfStatement,
        projectTags,
        ctx,
      })
    )
    const heightOfTimeAndAssignees = drawTimeAndAssignees(
      argsForDrawTimeAndAssignees({
        outcome,
        outcomeLeftX,
        outcomeTopY,
        outcomeWidth,
        outcomeStatementHeight: heightOfStatement,
        outcomeTagsHeight: heightOfTags,
        ctx,
      })
    )
    drawProgressBar(
      argsForDrawProgressBar({
        outcome,
        outcomeLeftX,
        outcomeTopY,
        outcomeWidth,
        outcomeStatementHeight: heightOfStatement,
        outcomeTagsHeight: heightOfTags,
        outcomeTimeAndAssigneesHeight: heightOfTimeAndAssignees,
        ctx,
      })
    )
    // TODO (later)
    // drawPeopleActive(argsForDrawPeopleActive({ outcome, ctx }))
    // TODO (later)
    // drawBeingEdited(argsForDrawBeingEdited({ outcome, ctx }))
  })

export default drawOutcome
