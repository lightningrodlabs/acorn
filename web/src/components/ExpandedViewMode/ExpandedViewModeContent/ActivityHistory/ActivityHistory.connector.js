import { fetchOutcomeHistory } from '../../../../redux/persistent/projects/outcome-history/actions'
import { connect } from 'react-redux'
import ActivityHistory from './ActivityHistory.component'

function mapStateToProps(state, ownProps) {
  const { projectId } = ownProps
  const outcomeHeaderHash = state.ui.expandedView.outcomeHeaderHash
  const outcomeHistory = state.projects.outcomeHistory[projectId] || {}
  return {
    outcomeHeaderHash,
    agents: state.agents,
    outcomeHistory: outcomeHistory[outcomeHeaderHash],
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  // TODO: what to do here about the fetchOutcomeHistory? looks like this is incomplete on the zome side
  return {
    fetchOutcomeHistory: (payload) => {
      return dispatch(fetchOutcomeHistory.create({ cellIdString, payload }))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivityHistory)
