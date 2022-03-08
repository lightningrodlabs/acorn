import { connect } from 'react-redux'
import PriorityGoal from './PriorityGoal.component'

function mapStateToProps(state, ownProps) {
  const { projectId, goal } = ownProps
  // filters all the GoalVotes down to a list
  // of only the Votes on the selected Goal
  const goalVotes = state.projects.goalVotes[projectId] || {}
  const allVotesArray = Object.values(goalVotes)
  const votes = allVotesArray.filter(function (goalVote) {
    return goalVote.goal_address === goal.headerHash
  })
  return {
    // name of the key 'whoami' MUST match the prop name
    // expected on the component
    whoami: state.whoami,
    votes,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  // const { projectId } = ownProps
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityGoal)
