import { connect } from 'react-redux'
import './PriorityPickerVote.scss'
import {
  createGoalVote,
  archiveGoalVote,
  updateGoalVote,
} from '../../../redux/persistent/projects/goal-votes/actions'
import PriorityPickerVote from './PriorityPickerVote.component'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'

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
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  return {
    createGoalVote: payload => {
      const outcomeVote = await projectsZomeApi.outcomeVote.create(cellId, payload)
      return dispatch(createGoalVote(cellIdString, outcomeVote))
    },
    updateGoalVote: (entry, headerHash) => {
      const updatedOutcomeVote = await projectsZomeApi.outcomeVote.update(cellId, { entry, headerHash })
      return dispatch(
        updateGoalVote(cellIdString, updatedOutcomeVote)
      )
    },
    archiveGoalVote: payload => {
      const deletedOutcomeVoteHash = await projectsZomeApi.outcomeVote.delete(cellId, payload)
      return dispatch(archiveGoalVote(cellIdString, deletedOutcomeVoteHash))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityPickerVote)
