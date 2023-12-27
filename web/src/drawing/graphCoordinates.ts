import { ActionHashB64 } from '@holochain/client'
import { sugiyama } from 'd3-dag'
import { coffmanGraham } from 'd3-dag/dist/sugiyama/layering/coffman-graham'
import { longestPath } from 'd3-dag/dist/sugiyama/layering/longest-path'
import { LayeringAlgorithm } from 'zod-models'
import {
  DimensionsState,
  CoordinatesState,
} from '../redux/ephemeral/layout/state-type'
import { Graph } from '../redux/persistent/projects/outcomes/outcomesAsGraph'
import checkOutcomeAgainstViewingFilters from './checkOutcomeAgainstViewingFilters'
import { connect } from 'd3-dag/dist/dag/create'

export default function layoutForGraph(
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
        node === undefined || allOutcomeDimensions[node.data.id] === undefined ? 0 : allOutcomeDimensions[node.data.id].width + 200
      const height =
        node === undefined || allOutcomeDimensions[node.data.id] === undefined ? 0 : allOutcomeDimensions[node.data.id].height + 200

      return [width, height]
    })
    .layering(layeringAlgo(layeringAlgorithm)())

  dagLayout(dag)

  // define the coordinates of each node
  const coordinates = {}
  for (const node of dag) {
    const dimensions = allOutcomeDimensions[node.data.id]
    if (dimensions === undefined) continue
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
