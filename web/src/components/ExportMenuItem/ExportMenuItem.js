import { connect } from 'react-redux'
import ExportMenuItem from './ExportMenuItem.component'

function mapDispatchToProps(dispatch) {
  return {}
}
function mapStateToProps(state) {
  const {
    ui: { activeProject },
  } = state
  // defensive coding for loading phase
  const goals = state.projects.goals[activeProject] || {}
  const edges = state.projects.edges[activeProject] || {}
  const goalMembers = state.projects.goalMembers[activeProject] || {}
  const goalComments = state.projects.goalComments[activeProject] || {}
  const goalVotes = state.projects.goalVotes[activeProject] || {}
  const entryPoints = state.projects.entryPoints[activeProject] || {}
  const activeProjectMeta = state.projects.projectMeta[activeProject] || {}
  const projectName = activeProjectMeta.name || ''

  return {
    projectName,
    data: {
      projectMeta: activeProjectMeta,
      agents: state.agents,
      goals,
      edges,
      goalMembers,
      goalComments,
      goalVotes,
      entryPoints,
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExportMenuItem)
