import { SELECTED_COLOR } from '../../../styles'
import {
  borderWidth,
  selectedOutlineMargin,
  selectedOutlineWidth,
  cornerRadius,
} from '../../dimensions'
import drawSelectedBorder from '../drawSelectedBorder'

/*
  Draw Selected Border
*/
export const argsForDrawSelectedBorder = ({
  outcomeLeftX,
  outcomeTopY,
  outcomeWidth,
  outcomeHeight,
  isSelected,
  ctx,
}: {
  outcomeLeftX: number
  outcomeTopY: number
  outcomeWidth: number
  outcomeHeight: number
  isSelected: boolean
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawSelectedBorder>[0] => {
  const halfBorder = borderWidth / 2 // for use with 'stroke' of the border

  let xPosition =
    outcomeLeftX -
    selectedOutlineMargin +
    1 -
    halfBorder -
    selectedOutlineWidth / 2

  let yPosition =
    outcomeTopY -
    selectedOutlineMargin +
    1 -
    halfBorder -
    selectedOutlineWidth / 2

  let width =
    outcomeWidth +
    2 * (selectedOutlineMargin - 1) +
    borderWidth +
    selectedOutlineWidth

  let height =
    outcomeHeight +
    2 * (selectedOutlineMargin - 1) +
    borderWidth +
    selectedOutlineWidth
  let selectedCornerRadius = cornerRadius + selectedOutlineMargin * 2 + 2

  const args: Parameters<typeof drawSelectedBorder>[0] = {
    isSelected,
    xPosition,
    yPosition,
    width,
    height,
    cornerRadius: selectedCornerRadius,
    strokeColor: SELECTED_COLOR,
    strokeWidth: selectedOutlineWidth,
    ctx,
  }
  return args
}
