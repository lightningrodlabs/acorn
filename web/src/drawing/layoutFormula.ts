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
import { connect } from 'd3-dag/dist/dag/create'
import { sugiyama } from 'd3-dag'
import { coffmanGraham } from 'd3-dag/dist/sugiyama/layering/coffman-graham'
import { Graph } from '../redux/persistent/projects/outcomes/outcomesAsGraph'
import { longestPath } from 'd3-dag/dist/sugiyama/layering/longest-path'

function checkOutcomeAgainstViewingFilters(
  outcome: ComputedOutcome,
  hiddenSmalls: boolean,
  hiddenAchieved: boolean
): boolean {
  return !(
    (hiddenAchieved &&
      outcome.computedAchievementStatus.simple ===
        ComputedSimpleAchievementStatus.Achieved) ||
    (hiddenSmalls && outcome.computedScope === ComputedScope.Small)
  )
}

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

function layoutForGraph(
  graph: Graph,
  layeringAlgorithm: LayeringAlgorithm,
  allOutcomeDimensions: DimensionsState,
  projectCollapsedOutcomes: {
    [outcomeActionHash: ActionHashB64]: boolean
  },
  hiddenSmalls: boolean,
  hiddenAchieved: boolean
): CoordinatesState {
  // run the layout algorithm, which will set an x and y property onto
  // each node
  const nodeConnections: string[][] = []
  const connections = graph.connections
  const outcomes = graph.outcomes.computedOutcomesKeyed

  const layeringAlgo = (layeringAlgo: LayeringAlgorithm) => {
    switch (layeringAlgo) {
      // TODO: add back in when we figure out how to not have it crash
      // case LayeringAlgorithm.Simplex:
      // return simplex
      case 'LongestPath':
        return longestPath
      case 'CoffmanGraham':
        return coffmanGraham
      default:
        return coffmanGraham
    }
  }

  // add all the nodes with connections
  Object.keys(connections).forEach((hash) => {
    const connection = connections[hash]

    if (
      !checkOutcomeAgainstViewingFilters(
        outcomes[connection.parentActionHash],
        hiddenSmalls,
        hiddenAchieved
      ) || // parent is hidden
      !checkOutcomeAgainstViewingFilters(
        outcomes[connection.childActionHash],
        hiddenSmalls,
        hiddenAchieved
      ) || // child is hidden
      projectCollapsedOutcomes[connection.parentActionHash] || // parent is collapsed
      projectCollapsedOutcomes[connection.childActionHash] // child is collapsed
    ) {
      return
    }

    nodeConnections.push([
      connection.parentActionHash,
      connection.childActionHash,
    ])
  })

  // add all the nodes without connections
  Object.keys(outcomes).forEach((hash) => {
    const outcome = outcomes[hash]
    if (
      !nodeConnections.find(
        (nodeConnection) =>
          nodeConnection[0] === outcome.actionHash ||
          nodeConnection[1] === outcome.actionHash
      ) &&
      checkOutcomeAgainstViewingFilters(outcome, hiddenSmalls, hiddenAchieved)
    ) {
      nodeConnections.push([outcome.actionHash, outcome.actionHash])
    }
  })

  // if there are no nodes, return an empty object
  if (!nodeConnections.length) return {}

  const create = connect().single(true) // allow single nodes without connections
  const dag = create(nodeConnections as any)
  const dagLayout = sugiyama()
    .nodeSize((node: any) => {
      // width and height, plus some extra padding
      const width =
        node === undefined ? 0 : allOutcomeDimensions[node.data.id].width + 200
      const height =
        node === undefined ? 0 : allOutcomeDimensions[node.data.id].height + 200

      return [width, height]
    })
    .layering(layeringAlgo(layeringAlgorithm)())

  dagLayout(dag)

  // define the coordinates of each node
  const coordinates = {}
  for (const node of dag) {
    const width = allOutcomeDimensions[node.data.id].width
    const height = allOutcomeDimensions[node.data.id].height
    coordinates[node.data.id] = {
      // transform the coordinates so that the origin is at the top
      // left corner of the outcome
      x: node.x - width / 2,
      y: node.y - height / 2,
    }
  }

  return coordinates
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
  let coordinates = {}
  // just do this for efficiency, it's not going to
  // get displayed or rendered anywhere
  const ctx = document.createElement('canvas').getContext('2d')

  // determine what the dimensions of each outcome will be
  const allOutcomeDimensions: {
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
      allOutcomeDimensions[outcomeActionHash] = {
        width,
        height,
      }
    }
  )

  coordinates = layoutForGraph(
    graph,
    layeringAlgorithm,
    allOutcomeDimensions,
    collapsedOutcomes,
    hiddenSmalls,
    hiddenAchieved
  )

  return {
    coordinates,
    dimensions: allOutcomeDimensions,
  }
}
