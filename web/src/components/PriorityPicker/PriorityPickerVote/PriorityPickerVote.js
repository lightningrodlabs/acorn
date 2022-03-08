import { connect } from 'react-redux'
import './PriorityPickerVote.css'
import {
  createGoalVote,
  archiveGoalVote,
  updateGoalVote,
} from '../../../redux/persistent/projects/goal-votes/actions'
import PriorityPickerVote from './PriorityPickerVote.component'

function mapStateToProps(state, ownProps) {
  const { projectId, goalAddress } = ownProps
  // filters all the GoalVotes down to a list
  // of only the Votes on the selected Goal
  const goalVotes = state.projects.goalVotes[projectId] || {}
  const allVotesArray = Object.values(goalVotes)
  const votes = allVotesArray.filter(function (goalVote) {
    return goalVote.goal_address === goalAddress
  })
  return {
    whoami: state.whoami,
    goalAddress,
    votes,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    createGoalVote: payload => {
      return dispatch(createGoalVote.create({ cellIdString, payload }))
    },
    updateGoalVote: (entry, headerHash) => {
      return dispatch(
        updateGoalVote.create({ cellIdString, payload: { entry, headerHash } })
      )
    },
    archiveGoalVote: payload => {
      return dispatch(archiveGoalVote.create({ cellIdString, payload }))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityPickerVote)
