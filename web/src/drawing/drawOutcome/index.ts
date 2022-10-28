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
import { computeHeightsWithSpacing } from './computeArguments/computeHeightsWithSpacing'
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
  skipStatementRender,
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
  skipStatementRender?: boolean
  useLineLimit: boolean
  zoomLevel: number
  isTopPriority: boolean
  isSelected: boolean
  // canvas context
  ctx: CanvasRenderingContext2D
}) =>
  draw(ctx, () => {
    /*
      Backgrounds and borders of the card
    */
    drawSelectedBorder(
      argsForDrawSelectedBorder({
        outcomeLeftX,
        outcomeTopY,
        outcomeHeight,
        outcomeWidth,
        isSelected,
        zoomLevel,
        ctx,
      })
    )
    drawGlow(
      argsForDrawGlow({
        outcomeLeftX,
        outcomeTopY,
        outcomeWidth,
        outcomeHeight,
        useGlow: isTopPriority,
        zoomLevel,
        ctx,
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
        zoomLevel,
        ctx,
      })
    )

    /*
     Contents of the Card
    */
    const heightOfDescendantsAchievementStatus = drawDescendantsAchievementStatus(
      argsForDrawDescendantsAchievementStatus({
        outcome,
        outcomeLeftX,
        outcomeTopY,
        topOffsetY: computeHeightsWithSpacing([]), // no prior elements
        zoomLevel,
        ctx,
      })
    )
    const heightOfStatement = drawStatement(
      argsForDrawStatement({
        skipRender: skipStatementRender,
        useLineLimit,
        outcome,
        outcomeLeftX,
        outcomeTopY,
        outcomeWidth,
        topOffsetY: computeHeightsWithSpacing([
          heightOfDescendantsAchievementStatus,
        ]),
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
        topOffsetY: computeHeightsWithSpacing([
          heightOfDescendantsAchievementStatus,
          heightOfStatement,
        ]),
        projectTags,
        zoomLevel,
        ctx,
      })
    )
    const heightOfTimeAndAssignees = drawTimeAndAssignees(
      argsForDrawTimeAndAssignees({
        outcome,
        outcomeLeftX,
        outcomeTopY,
        outcomeWidth,
        topOffsetY: computeHeightsWithSpacing([
          heightOfDescendantsAchievementStatus,
          heightOfStatement,
          heightOfTags,
        ]),
        ctx,
        zoomLevel,
      })
    )
    const heightOfProgressBar = drawProgressBar(
      argsForDrawProgressBar({
        outcome,
        outcomeLeftX,
        outcomeTopY,
        outcomeWidth,
        topOffsetY: computeHeightsWithSpacing([
          heightOfDescendantsAchievementStatus,
          heightOfStatement,
          heightOfTags,
          heightOfTimeAndAssignees,
        ]),
        zoomLevel,
        ctx,
      })
    )
    // TODO (later)
    // drawPeopleActive(argsForDrawPeopleActive({ outcome, ctx }))
    // TODO (later)
    // drawBeingEdited(argsForDrawBeingEdited({ outcome, ctx }))
  })

export default drawOutcome
