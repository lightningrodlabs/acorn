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
import * as flextree from 'd3-flextree'
const fl = flextree.flextree

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

function layoutForTree(
  tree: ComputedOutcome,
  allOutcomeDimensions: DimensionsState,
  projectCollapsedOutcomes: {
    [outcomeActionHash: ActionHashB64]: boolean
  },
  hiddenSmalls: boolean,
  hiddenAchieved: boolean
): CoordinatesState {
  const layout = fl().spacing((nodeA, nodeB) => {
    return nodeA.path(nodeB).length * 40
  })

  const layoutTree = {}
  // use recursion to add each outcome as a node in the graph
  function addOutcome(outcome: ComputedOutcome, node: any, level: number) {
    let numDescendants = 0
    node.children = []
    // Skip over the Outcome if it is included in the list
    // of collapsed Outcomes
    if (!projectCollapsedOutcomes[outcome.actionHash]) {
      outcome.children.forEach((childOutcome) => {
        const childNode = {}
        // filter out children who don't match the viewing filter criteria
        if (
          checkOutcomeAgainstViewingFilters(
            childOutcome,
            hiddenSmalls,
            hiddenAchieved
          )
        ) {
          const descendantCount = addOutcome(childOutcome, childNode, level + 1)
          node.children.push(childNode)
          numDescendants += descendantCount + 1
        }
      })
    }

    const width = allOutcomeDimensions[outcome.actionHash].width
    // to create the dynamic vertical height, we apply
    // a power law to the number of descendants, with a heightened baseline
    // because the number of descendants is a good measure of how wide this tree
    // might be
    const VERTICAL_SPACING = 100
    const height =
      allOutcomeDimensions[outcome.actionHash].height +
      (numDescendants > 0 ? Math.pow(numDescendants + 25, 1.5) : 60) +
      VERTICAL_SPACING

    node.actionHash = outcome.actionHash
    node.size = [width, height]

    return numDescendants
  }
  // kick off the recursion
  addOutcome(tree, layoutTree, 1)

  const flTree = layout.hierarchy(layoutTree)
  // run the layout algorithm, which will set an x and y property onto
  // each node
  layout(flTree)
  // create a coordinates object
  const coordinates = {}
  // update the coordinates object
  flTree.each((node) => {
    // coordinates will represent the top left,
    // but as-is they represent the center, so re-adjust them by half
    // the width of the outcome
    coordinates[node.data.actionHash] = {
      x: node.x - node.size[0] / 2,
      y: node.y,
    }
  })
  return coordinates
}

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

function calculateCoordinatesForClassic(
  graph: Graph,
  allOutcomeDimensions: DimensionsState,
  collapsedOutcomes: {
    [outcomeActionHash: string]: boolean
  },
  hiddenSmalls: boolean,
  hiddenAchieved: boolean
): CoordinatesState {
  // based on the dimensions, determine what the layout of each
  // distinct tree will be
  const layouts = graph.outcomes.computedOutcomesAsTree
    .filter((computedOutcome) => {
      // filter out trees which have been hidden
      return checkOutcomeAgainstViewingFilters(
        computedOutcome,
        hiddenSmalls,
        hiddenAchieved
      )
    })
    .map((tree) => ({
      outcome: tree,
      layout: layoutForTree(
        tree,
        allOutcomeDimensions,
        collapsedOutcomes,
        hiddenSmalls,
        hiddenAchieved
      ),
    }))
  const HORIZONTAL_TREE_SPACING = 100
  let coordinates: CoordinatesState = {}
  // coordinates will be adjusted each time through this iteration
  layouts.forEach((tree, index) => {
    // in the case of the first one, let it stay where it is
    if (index === 0) {
      const adjusted: CoordinatesState = {}
      const offsetFromZero = tree.layout[tree.outcome.actionHash].y
      Object.keys(tree.layout).forEach((coordKey) => {
        adjusted[coordKey] = {
          x: tree.layout[coordKey].x,
          y: tree.layout[coordKey].y - offsetFromZero,
        }
      })
      coordinates = {
        ...adjusted,
      }
    } else {
      // in the case of all the rest, push it right, according to wherever the last one was positioned + spacing
      const [_ltop, lastTreeRight, _lbottom, _lleft] = getBoundingRec(
        layouts[index - 1].outcome,
        coordinates,
        allOutcomeDimensions
      )
      const [_ttop, _tright, _tbottom, thisTreeLeft] = getBoundingRec(
        tree.outcome,
        tree.layout,
        allOutcomeDimensions
      )
      const adjusted: CoordinatesState = {}
      const yOffset = -1 * tree.layout[tree.outcome.actionHash].y
      const xOffset = lastTreeRight - thisTreeLeft + HORIZONTAL_TREE_SPACING
      Object.keys(tree.layout).forEach((coordKey) => {
        // adjust the coordinate by the xOffset and the yOffset
        adjusted[coordKey] = {
          x: xOffset + tree.layout[coordKey].x,
          y: yOffset + tree.layout[coordKey].y,
        }
      })
      coordinates = {
        ...coordinates,
        ...adjusted,
      }
    }
  })

  return coordinates
}

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
      case LayeringAlgorithm.LongestPath:
        return longestPath
      case LayeringAlgorithm.CoffmanGraham:
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
