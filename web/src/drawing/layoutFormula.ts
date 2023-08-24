import { getOutcomeWidth, getOutcomeHeight } from './dimensions'
import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
  LayeringAlgorithm,
  Tag,
} from '../types'
import { ActionHashB64, WithActionHash } from '../types/shared'
import {
  CoordinatesState,
  DimensionsState,
  LayoutState,
} from '../redux/ephemeral/layout/state-type'
import { Graph } from '../redux/persistent/projects/outcomes/outcomesAsGraph'
import calculateCoordinatesForClassic from './classicCoordinates'
import layoutForGraph from './graphCoordinates'

function getBoundingRec(
  outcome: ComputedOutcome,
  allOutcomeCoordinates: CoordinatesState,
  allOutcomeDimensions: DimensionsState
) {
  const origCoord = allOutcomeCoordinates[outcome.actionHash]
  if (!origCoord) {
    return
  }
  let boundLeft = origCoord.x
  let boundTop = origCoord.y
  let boundRight = origCoord.x + allOutcomeDimensions[outcome.actionHash].width
  let boundBottom =
    origCoord.y + allOutcomeDimensions[outcome.actionHash].height

  function updateLimits(outcomeToCheck: ComputedOutcome) {
    const topLeftCoord = allOutcomeCoordinates[outcomeToCheck.actionHash]
    if (!topLeftCoord) {
      return
    }
    const width = allOutcomeDimensions[outcomeToCheck.actionHash].width
    const height = allOutcomeDimensions[outcomeToCheck.actionHash].height
    const top = topLeftCoord.y
    const left = topLeftCoord.x
    const right = left + width
    const bottom = top + height
    boundTop = Math.min(top, boundTop)
    boundRight = Math.max(right, boundRight)
    boundBottom = Math.max(bottom, boundBottom)
    boundLeft = Math.min(left, boundLeft)
    outcomeToCheck.children.forEach(updateLimits)
  }
  updateLimits(outcome)

  const padding = 15
  boundTop -= padding
  boundRight += padding
  boundBottom += padding
  boundLeft -= padding

  return [boundTop, boundRight, boundBottom, boundLeft]
}

export { getBoundingRec }

const calculateCoordinatesForLayout = (
  layeringAlgorithm: LayeringAlgorithm,
  graph: Graph,
  allOutcomeDimensions: DimensionsState,
  collapsedOutcomes: {
    [outcomeActionHash: string]: boolean
  },
  hiddenSmalls: boolean,
  hiddenAchieved: boolean
) => {
  if (layeringAlgorithm === LayeringAlgorithm.Classic)
    return calculateCoordinatesForClassic(
      graph,
      allOutcomeDimensions,
      collapsedOutcomes,
      hiddenSmalls,
      hiddenAchieved
    )
  else
    return layoutForGraph(
      graph,
      layeringAlgorithm,
      allOutcomeDimensions,
      collapsedOutcomes,
      hiddenSmalls,
      hiddenAchieved
    )
}

export default function layoutFormula(
  graph: Graph,
  layeringAlgorithm: LayeringAlgorithm,
  zoomLevel: number,
  projectTags: WithActionHash<Tag>[],
  collapsedOutcomes: {
    [outcomeActionHash: string]: boolean
  },
  hiddenSmalls: boolean,
  hiddenAchieved: boolean
): LayoutState {
  // just do this for efficiency, it's not going to
  // get displayed or rendered anywhere
  const ctx = document.createElement('canvas').getContext('2d')

  // determine what the dimensions of each outcome will be
  const dimensions: {
    [actionHash: ActionHashB64]: { width: number; height: number }
  } = {}

  Object.keys(graph.outcomes.computedOutcomesKeyed).forEach(
    (outcomeActionHash) => {
      const outcome = graph.outcomes.computedOutcomesKeyed[outcomeActionHash]
      const width = getOutcomeWidth({ outcome, zoomLevel })
      const height = getOutcomeHeight({
        ctx,
        outcome,
        zoomLevel,
        width,
        projectTags,
      })
      dimensions[outcomeActionHash] = {
        width,
        height,
      }
    }
  )

  const coordinates = calculateCoordinatesForLayout(
    layeringAlgorithm,
    graph,
    dimensions,
    collapsedOutcomes,
    hiddenSmalls,
    hiddenAchieved
  )

  return {
    coordinates,
    dimensions,
  }
}
