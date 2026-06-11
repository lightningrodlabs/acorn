import { getOutcomeWidth, getOutcomeHeight } from './dimensions'
import {
  ComputedOutcome,
  ComputedScope,
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
import computeDetailBands, {
  bandCanvasScale,
  bandEffectiveZoom,
  collapsedByDetailBands,
} from './detailBands'

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
  hiddenAchieved: boolean,
  // when set, perform focus+context (Degree-of-Interest based)
  // sizing and elision, relative to this Outcome
  focusOutcomeActionHash?: ActionHashB64
): LayoutState {
  // just do this for efficiency, it's not going to
  // get displayed or rendered anywhere
  const ctx = document.createElement('canvas').getContext('2d')

  // can be null, when the focus Outcome isn't in this graph
  const detailBands = focusOutcomeActionHash
    ? computeDetailBands(graph, focusOutcomeActionHash)
    : null

  // determine what the dimensions of each outcome will be
  const dimensions: {
    [actionHash: ActionHashB64]: { width: number; height: number }
  } = {}

  Object.keys(graph.outcomes.computedOutcomesKeyed).forEach(
    (outcomeActionHash) => {
      const outcome = graph.outcomes.computedOutcomesKeyed[outcomeActionHash]
      // when focus+context is active, each Outcome is measured at the
      // effective zoom level of its detail band, instead of the real
      // zoom level, so that nearer-to-focus Outcomes carry more
      // content. cards always show their real statement text in this
      // mode, never the placeholder bars. on top of that, cards are
      // scaled up in canvas space as the user zooms out, to hold a
      // band-dependent minimum readable on-screen size
      const band = detailBands ? detailBands[outcomeActionHash] : undefined
      const effectiveZoomLevel = detailBands
        ? bandEffectiveZoom(
            band,
            zoomLevel,
            outcome.computedScope === ComputedScope.Small
          )
        : zoomLevel
      const canvasScale = detailBands ? bandCanvasScale(band, zoomLevel) : 1
      const width = getOutcomeWidth({ outcome, zoomLevel: effectiveZoomLevel })
      const height = getOutcomeHeight({
        ctx,
        outcome,
        zoomLevel: effectiveZoomLevel,
        width,
        projectTags,
        noStatementPlaceholder: !!detailBands,
      })
      dimensions[outcomeActionHash] = {
        width: width * canvasScale,
        height: height * canvasScale,
      }
    }
  )

  // Outcomes whose children all fall below the detail threshold are
  // laid out as if collapsed, eliding their subtrees
  const effectiveCollapsedOutcomes = detailBands
    ? {
        ...collapsedOutcomes,
        ...collapsedByDetailBands(graph, detailBands),
      }
    : collapsedOutcomes

  const coordinates = calculateCoordinatesForLayout(
    layeringAlgorithm,
    graph,
    dimensions,
    effectiveCollapsedOutcomes,
    hiddenSmalls,
    hiddenAchieved
  )

  return detailBands
    ? {
        coordinates,
        dimensions,
        detailBands,
      }
    : {
        coordinates,
        dimensions,
      }
}
