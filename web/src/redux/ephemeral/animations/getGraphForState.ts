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
    memberProfiles: state.projects.members[projectId]?.profiles || [],
  }
  return outcomesAsGraph(graphData, { withMembers: true })
}
