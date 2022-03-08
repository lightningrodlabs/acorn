import { fetchGoalHistory } from '../../../../redux/persistent/projects/goal-history/actions'
import { connect } from 'react-redux'
import ActivityHistory from './ActivityHistory.component'

function mapStateToProps(state, ownProps) {
  const { projectId } = ownProps
  const goalAddress = state.ui.expandedView.goalAddress
  const goalHistory = state.projects.goalHistory[projectId] || {}
  return {
    goalAddress,
    agents: state.agents,
    goalHistory: goalHistory[goalAddress],
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    fetchGoalHistory: (payload) => {
      return dispatch(fetchGoalHistory.create({ cellIdString, payload }))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivityHistory)
