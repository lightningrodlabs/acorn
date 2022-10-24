import dagre from 'dagre'
import { getOutcomeWidth, getOutcomeHeight } from './dimensions'
import outcomesAsTrees, {
  TreeData,
} from '../redux/persistent/projects/outcomes/outcomesAsTrees'
import { ComputedOutcome, Tag } from '../types'
import { ActionHashB64, WithActionHash } from '../types/shared'

const VERTICAL_SPACING = 160

function getBoundingRec(
  outcome: ComputedOutcome,
  zoomLevel: number,
  ctx: CanvasRenderingContext2D,
  projectTags: WithActionHash<Tag>[],
  allOutcomeCoordinates: {
    [actionHash: ActionHashB64]: { x: number; y: number }
  }
) {
  const origCoord = allOutcomeCoordinates[outcome.actionHash]
  if (!origCoord) {
    return
  }
  let boundTop = origCoord.y
  let boundRight = origCoord.x
  let boundBottom = origCoord.y
  let boundLeft = origCoord.x

  function updateLimits(outcomeToCheck) {
    const topLeftCoord = allOutcomeCoordinates[outcomeToCheck.actionHash]
    if (!topLeftCoord) {
      return
    }
    const width = getOutcomeWidth()
    const height = getOutcomeHeight({
      ctx,
      outcome: outcomeToCheck,
      projectTags,
      zoomLevel,
      width,
    })
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

export interface Layout {
  [outcomeActionHash: ActionHashB64]: {
    x: number
    y: number
  }
}

function layoutForTree(
  ctx: CanvasRenderingContext2D,
  tree: ComputedOutcome,
  zoomLevel: number,
  projectTags: WithActionHash<Tag>[]
): Layout {
  // create a graph
  const graph = new dagre.graphlib.Graph()
    .setGraph({})
    .setDefaultEdgeLabel(function () {
      return {}
    })

  // use recursion to add each outcome as a node in the graph
  function addOutcome(outcome: ComputedOutcome) {
    const width = getOutcomeWidth()
    const height = getOutcomeHeight({
      ctx,
      outcome,
      zoomLevel,
      width,
      projectTags,
    }) + VERTICAL_SPACING
    graph.setNode(outcome.actionHash, {
      width,
      height,
    })
    outcome.children.forEach((childOutcome) => {
      addOutcome(childOutcome)
      // add each connection as an connection in the graph
      graph.setEdge(outcome.actionHash, childOutcome.actionHash)
    })
  }
  // kick off the recursion
  addOutcome(tree)

  // run the layout algorithm, which will set an x and y property onto
  // each node
  dagre.layout(graph)
  // create a coordinates object
  const coordinates = {}
  // update the coordinates object
  graph.nodes().forEach((actionHash) => {
    coordinates[actionHash] = {
      x: graph.node(actionHash).x,
      y: graph.node(actionHash).y,
    }
  })
  return coordinates
}

export default function layoutFormula(
  data: TreeData,
  zoomLevel: number,
  projectTags: WithActionHash<Tag>[]
): Layout {
  const trees = outcomesAsTrees(data, { withMembers: true })

  let coordinates = {}
  // just do this for efficiency, it's not going to
  // get displayed or rendered anywhere
  const ctx = document.createElement('canvas').getContext('2d')
  const layouts = trees.computedOutcomesAsTree.map((tree) => ({
    outcome: tree,
    layout: layoutForTree(ctx, tree, zoomLevel, projectTags),
  }))
  const HORIZONTAL_TREE_SPACING = 15
  // coordinates will be adjusted each time through this iteration
  layouts.forEach((tree, index) => {
    // in the case of the first one, let it stay where it is
    if (index === 0) {
      const adjusted: Layout = {}
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
      const lastTree = layouts[index - 1].outcome
      const [top, right, bottom, left] = getBoundingRec(
        lastTree,
        zoomLevel,
        ctx,
        projectTags,
        coordinates
      )
      const adjusted: Layout = {}
      const offsetFromZero = tree.layout[tree.outcome.actionHash].y
      Object.keys(tree.layout).forEach((coordKey) => {
        adjusted[coordKey] = {
          x: tree.layout[coordKey].x + right + HORIZONTAL_TREE_SPACING,
          y: tree.layout[coordKey].y - offsetFromZero,
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
