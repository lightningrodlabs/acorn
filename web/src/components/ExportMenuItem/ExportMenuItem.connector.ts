import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import ExportMenuItem from './ExportMenuItem.component'

function mapStateToProps(state: RootState) {
  const {
    ui: { activeProject },
  } = state
  // defensive coding for loading phase
  const outcomes = state.projects.outcomes[activeProject] || {}
  const connections = state.projects.connections[activeProject] || {}
  const outcomeMembers = state.projects.outcomeMembers[activeProject] || {}
  const outcomeComments = state.projects.outcomeComments[activeProject] || {}
  const outcomeVotes = state.projects.outcomeVotes[activeProject] || {}
  const entryPoints = state.projects.entryPoints[activeProject] || {}
  const activeProjectMeta = state.projects.projectMeta[activeProject] || {name: ''}
  const projectName = activeProjectMeta.name

  return {
    projectName,
    data: {
      projectMeta: activeProjectMeta,
      agents: state.agents,
      outcomes,
      connections,
      outcomeMembers,
      outcomeComments,
      outcomeVotes,
      entryPoints,
    },
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(ExportMenuItem)
