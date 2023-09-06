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
  (
    agents,
    outcomes,
    connections,
    outcomeMembers
  ) => {
    console.log('recalculating computedOutcomes!')
    const treeData = {
      agents,
      outcomes,
      connections,
      outcomeMembers,
    }
    const outcomeTrees = outcomesAsGraph(treeData, { withMembers: true })
      .outcomes
    return outcomeTrees
  }
)

export default selectAndComputeOutcomes
