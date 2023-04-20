import outcomesAsGraph, {
  Graph,
  GraphData,
} from '../../persistent/projects/outcomes/outcomesAsGraph'
import { RootState } from '../../reducer'

export function getGraphForState(state: RootState): Graph {
  const projectId = state.ui.activeProject
  const graphData: GraphData = {
    outcomes: state.projects.outcomes[projectId] || {},
    connections: state.projects.connections[projectId] || {},
    outcomeMembers: state.projects.outcomeMembers[projectId] || {},
    agents: state.agents,
  }
  return outcomesAsGraph(graphData, { withMembers: true })
}
