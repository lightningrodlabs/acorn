import { createSelector } from 'reselect'
import outcomesAsGraph from '../redux/persistent/projects/outcomes/outcomesAsGraph'
import { RootState } from '../redux/reducer'
import { activeEffectiveDiff, overlayProject } from '../redux/ephemeral/draft/changes'

const selectAndComputeOutcomes = createSelector(
  (state: RootState) => state.projects.members[state.ui.activeProject]?.profiles || [],
  (state: RootState) => state.projects.outcomes[state.ui.activeProject] || {},
  (state: RootState) =>
    state.projects.connections[state.ui.activeProject] || {},
  (state: RootState) =>
    state.projects.outcomeMembers[state.ui.activeProject] || {},
  // draft inputs (clarity-tree draft pipeline L2) — recompute when the proposed
  // diff or per-change decisions change so the overlay re-renders live
  (state: RootState) => state.ui.draft,
  (state: RootState) => state.ui.activeProject,
  (memberProfiles, outcomes, connections, outcomeMembers, draft, activeProject) => {
    // overlay an open draft over the persisted slices, for rendering only — the
    // persisted projects.* slices are never mutated (draft never persists)
    const draftDiff = activeEffectiveDiff(draft, activeProject)
    const overlaid = overlayProject(outcomes, connections, draftDiff)
    const treeData = {
      memberProfiles,
      outcomes: overlaid.outcomes,
      connections: overlaid.connections,
      outcomeMembers,
    }
    const outcomeTrees = outcomesAsGraph(treeData, { withMembers: true })
      .outcomes
    return outcomeTrees
  }
)

export default selectAndComputeOutcomes
