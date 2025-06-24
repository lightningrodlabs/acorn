import { createSelector } from 'reselect'
import outcomesAsGraph from '../redux/persistent/projects/outcomes/outcomesAsGraph'
import { RootState } from '../redux/reducer'

const selectAndComputeOutcomes = createSelector(
  (state: RootState) => state.projects.members[state.ui.activeProject]?.profiles || [],
  (state: RootState) => state.projects.outcomes[state.ui.activeProject] || {},
  (state: RootState) =>
    state.projects.connections[state.ui.activeProject] || {},
  (state: RootState) =>
    state.projects.outcomeMembers[state.ui.activeProject] || {},
  (memberProfiles, outcomes, connections, outcomeMembers) => {
    // console.log('recalculating computedOutcomes!', {
    //   agents,
    //   outcomes,
    //   connections,
    //   outcomeMembers,
    // })
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

export default selectAndComputeOutcomes
