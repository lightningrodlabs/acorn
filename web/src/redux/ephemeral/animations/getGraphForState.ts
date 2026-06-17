import outcomesAsGraph, {
  Graph,
  GraphData,
} from '../../persistent/projects/outcomes/outcomesAsGraph'
import { RootState } from '../../reducer'
import { activeEffectiveDiff, overlayProject } from '../draft/changes'

export function getGraphForState(state: RootState): Graph {
  const projectId = state.ui.activeProject
  // Overlay any open draft (clarity-tree draft pipeline L2) so layout positions
  // proposed/ghost nodes too — for rendering only; the persisted slices are
  // untouched, so the draft never persists.
  const draftDiff = activeEffectiveDiff(state.ui.draft, projectId)
  const { outcomes, connections } = overlayProject(
    state.projects.outcomes[projectId] || {},
    state.projects.connections[projectId] || {},
    draftDiff
  )
  const graphData: GraphData = {
    outcomes,
    connections,
    outcomeMembers: state.projects.outcomeMembers[projectId] || {},
    memberProfiles: state.projects.members[projectId]?.profiles || [],
  }
  return outcomesAsGraph(graphData, { withMembers: true })
}
