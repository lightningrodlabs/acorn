import { createSelector } from 'reselect'
import outcomesAsGraph from '../redux/persistent/projects/outcomes/outcomesAsGraph'
import { RootState } from '../redux/reducer'

const selectAndComputeOutcomes = createSelector(
  (state: RootState) => state.agents,
  (state: RootState) => state.projects.outcomes[state.ui.activeProject] || {},
  (state: RootState) =>
    state.projects.connections[state.ui.activeProject] || {},
  (state: RootState) =>
    state.projects.outcomeMembers[state.ui.activeProject] || {},
  // (state: RootState) => state.projects.outcomeVotes[state.ui.activeProject],
  // (state: RootState) => state.projects.outcomeComments[state.ui.activeProject],
  (
    agents,
    outcomes,
    connections,
    outcomeMembers
    // outcomeVotes,
    // outcomeComments
  ) => {
    console.log('recalculating computedOutcomes!')
    const treeData = {
      agents,
      outcomes,
      connections,
      outcomeMembers,
      outcomeVotes: {},
      outcomeComments: {},
    }
    const outcomeTrees = outcomesAsGraph(treeData, { withMembers: true })
      .outcomes
    return outcomeTrees
  }
)

export default selectAndComputeOutcomes
