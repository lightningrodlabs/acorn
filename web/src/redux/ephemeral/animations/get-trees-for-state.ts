import { ProjectComputedOutcomes } from '../../../context/ComputedOutcomeContext'
import outcomesAsTrees, {
  TreeData,
} from '../../persistent/projects/outcomes/outcomesAsTrees'
import { RootState } from '../../reducer'

export function getTreesForState(state: RootState): ProjectComputedOutcomes {
  const projectId = state.ui.activeProject
  const graphData: TreeData = {
    outcomes: state.projects.outcomes[projectId] || {},
    connections: state.projects.connections[projectId] || {},
    outcomeMembers: state.projects.outcomeMembers[projectId] || {},
    agents: state.agents,
  }
  return outcomesAsTrees(graphData, { withMembers: true })
}
