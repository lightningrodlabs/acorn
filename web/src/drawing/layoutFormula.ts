import * as flextree from 'd3-flextree'
import { getOutcomeWidth, getOutcomeHeight } from './dimensions'
import { ComputedOutcome, Tag } from '../types'
import { ActionHashB64, WithActionHash } from '../types/shared'
import { ProjectComputedOutcomes } from '../context/ComputedOutcomeContext'

const fl = flextree.flextree

const VERTICAL_SPACING = 100

function getBoundingRec(
  outcome: ComputedOutcome,
  allOutcomeCoordinates: {
    [actionHash: ActionHashB64]: { x: number; y: number }
  },
  allOutcomeDimensions: {
    [actionHash: ActionHashB64]: { width: number; height: number }
  }
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

export interface Layout {
  [outcomeActionHash: ActionHashB64]: {
    x: number
    y: number
  }
}

function layoutForTree(
  tree: ComputedOutcome,
  allOutcomeDimensions: {
    [actionHash: ActionHashB64]: { width: number; height: number }
  },
  projectCollapsedOutcomes: {
    [outcomeActionHash: ActionHashB64]: boolean
  }
): Layout {
  // create a graph
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
    console.log(projectCollapsedOutcomes, !projectCollapsedOutcomes[outcome.actionHash])
    if (!projectCollapsedOutcomes[outcome.actionHash]) {
      outcome.children.forEach((childOutcome) => {
        const childNode = {}
        const descendantCount = addOutcome(childOutcome, childNode, level + 1)
        node.children.push(childNode)
        numDescendants += descendantCount + 1
      })
    }

    const width = allOutcomeDimensions[outcome.actionHash].width
    // to create the dynamic vertical height, we apply
    // a power law to the number of descendants, with a heightened baseline
    // because the number of descendants is a good measure of how wide this tree
    // might be
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

export default function layoutFormula(
  trees: ProjectComputedOutcomes,
  zoomLevel: number,
  projectTags: WithActionHash<Tag>[],
  projectCollapsedOutcomes: {
    [outcomeActionHash: ActionHashB64]: boolean
  }
): Layout {
  let coordinates = {}
  // just do this for efficiency, it's not going to
  // get displayed or rendered anywhere
  const ctx = document.createElement('canvas').getContext('2d')

  // determine what the dimensions of each outcome will be
  const allOutcomeDimensions: {
    [actionHash: ActionHashB64]: { width: number; height: number }
  } = {}
  Object.keys(trees.computedOutcomesKeyed).forEach((outcomeActionHash) => {
    const outcome = trees.computedOutcomesKeyed[outcomeActionHash]
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
  })

  // based on the dimensions, determine what the layout of each
  // distinct tree will be
  const layouts = trees.computedOutcomesAsTree.map((tree) => ({
    outcome: tree,
    layout: layoutForTree(tree, allOutcomeDimensions, projectCollapsedOutcomes),
  }))
  const HORIZONTAL_TREE_SPACING = 100
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
      const adjusted: Layout = {}
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
