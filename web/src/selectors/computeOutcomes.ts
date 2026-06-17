import { createSelector } from 'reselect'
import outcomesAsGraph from '../redux/persistent/projects/outcomes/outcomesAsGraph'
import { RootState } from '../redux/reducer'
import { activeEffectiveDiff, overlayProject } from '../redux/ephemeral/draft/changes'

// The COMMITTED computed tree — built only from the persisted projects.* slices,
// with NO draft overlay. This is what ComputedOutcomeContext provides, so every
// editor that reads it (expanded view, context menu, table view, the map's
// hit-testing) operates on real, committed data. Critical for the draft
// invariant: a draft must never reach an edit path that writes to the DHT.
const selectAndComputeOutcomes = createSelector(
  (state: RootState) => state.projects.members[state.ui.activeProject]?.profiles || [],
  (state: RootState) => state.projects.outcomes[state.ui.activeProject] || {},
  (state: RootState) =>
    state.projects.connections[state.ui.activeProject] || {},
  (state: RootState) =>
    state.projects.outcomeMembers[state.ui.activeProject] || {},
  (memberProfiles, outcomes, connections, outcomeMembers) => {
    const treeData = {
      memberProfiles,
      outcomes,
      connections,
      outcomeMembers,
    }
    const outcomeTrees = outcomesAsGraph(treeData, { withMembers: true })
      .outcomes
    return outcomeTrees
  }
)

/**
 * The computed outcomes WITH an open draft overlaid (clarity-tree draft pipeline
 * L2), keyed by actionHash. This feeds ONLY the map canvas render — so proposed
 * nodes draw as ghosts and updated nodes show their proposed values — and is
 * deliberately NOT the value in ComputedOutcomeContext, so it can never flow into
 * an editor's save path. With no draft it equals the committed set.
 */
export const selectComputedOutcomesKeyedForRender = createSelector(
  (state: RootState) => state.projects.members[state.ui.activeProject]?.profiles || [],
  (state: RootState) => state.projects.outcomes[state.ui.activeProject] || {},
  (state: RootState) =>
    state.projects.connections[state.ui.activeProject] || {},
  (state: RootState) =>
    state.projects.outcomeMembers[state.ui.activeProject] || {},
  (state: RootState) => state.ui.draft,
  (state: RootState) => state.ui.activeProject,
  (memberProfiles, outcomes, connections, outcomeMembers, draft, activeProject) => {
    const draftDiff = activeEffectiveDiff(draft, activeProject)
    const overlaid = overlayProject(outcomes, connections, draftDiff)
    return outcomesAsGraph(
      {
        memberProfiles,
        outcomes: overlaid.outcomes,
        connections: overlaid.connections,
        outcomeMembers,
      },
      { withMembers: true }
    ).outcomes.computedOutcomesKeyed
  }
)

export default selectAndComputeOutcomes
