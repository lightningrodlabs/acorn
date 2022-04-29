import dagre from 'dagre'
import { outcomeWidth, getOutcomeHeight } from './dimensions'
import outcomesAsTrees, { TreeData } from '../redux/persistent/projects/outcomes/outcomesAsTrees'

const VERTICAL_SPACING = 50

function getBoundingRec(outcome, allOutcomeCoordinates) {
  const origCoord = allOutcomeCoordinates[outcome.headerHash]
  if (!origCoord) {
    return
  }
  let boundTop = origCoord.y
  let boundRight = origCoord.x
  let boundBottom = origCoord.y
  let boundLeft = origCoord.x

  function updateLimits(outcomeToCheck) {
    const topLeftCoord = allOutcomeCoordinates[outcomeToCheck.headerHash]
    if (!topLeftCoord) {
      return
    }
    const width = outcomeWidth
    const height = getOutcomeHeight(null, outcomeToCheck.content)
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

function layoutForTree(tree) {
  // create a graph
  const graph = new dagre.graphlib.Graph().setGraph({}).setDefaultEdgeLabel(function () {
    return {}
  })

  // use recursion to add each outcome as a node in the graph
  function addOutcome(outcome) {
    graph.setNode(outcome.headerHash, {
      width: outcomeWidth,
      height: getOutcomeHeight(null, outcome.content) + VERTICAL_SPACING,
    })
    outcome.children.forEach((childOutcome) => {
      addOutcome(childOutcome)
      // add each connection as an connection in the graph
      graph.setEdge(outcome.headerHash, childOutcome.headerHash)
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
  graph.nodes().forEach((headerHash) => {
    coordinates[headerHash] = {
      x: graph.node(headerHash).x,
      y: graph.node(headerHash).y,
    }
  })
  return coordinates
}

export default function layoutFormula(data: TreeData) {
  const trees = outcomesAsTrees(data)

  let coordinates = {}
  const layouts = trees.computedOutcomesAsTree.map((tree) => ({
    outcome: tree,
    layout: layoutForTree(tree),
  }))
  const HORIZONTAL_TREE_SPACING = 15
  // coordinates will be adjusted each time through this iteration
  layouts.forEach((tree, index) => {
    // in the case of the first one, let it stay where it is
    if (index === 0) {
      coordinates = tree.layout
    } else {
      // in the case of all the rest, push it right, according to wherever the last one was positioned + spacing
      const lastTree = layouts[index - 1].outcome
      const [top, right, bottom, left] = getBoundingRec(lastTree, coordinates)
      const adjusted = {}
      Object.keys(tree.layout).forEach((coordKey) => {
        adjusted[coordKey] = {
          x: tree.layout[coordKey].x + right + HORIZONTAL_TREE_SPACING,
          y: tree.layout[coordKey].y,
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
