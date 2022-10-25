import { OUTCOME_VERTICAL_SPACE_BETWEEN } from '../../dimensions'

export function computeHeightsWithSpacing(elementHeights: number[]) {
  // assume that we want at least one vertical_space_between
  // for the new element we're computing this for
  let height = OUTCOME_VERTICAL_SPACE_BETWEEN
  // for each additional prior element, decide whether we need to account
  // for vertical spacing for it
  elementHeights.forEach((elementHeight) => {
    height +=
      elementHeight > 0 ? OUTCOME_VERTICAL_SPACE_BETWEEN + elementHeight : 0
  })
  return height
}
