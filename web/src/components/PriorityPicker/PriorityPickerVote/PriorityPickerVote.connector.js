import { connect } from 'react-redux'
import './PriorityPickerVote.scss'
import {
  createOutcomeVote,
  deleteOutcomeVote,
  updateOutcomeVote,
} from '../../../redux/persistent/projects/outcome-votes/actions'
import PriorityPickerVote from './PriorityPickerVote.component'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'
import { cellIdFromString } from '../../../utils'

function mapStateToProps(state, ownProps) {
  const { projectId, outcomeAddress } = ownProps
  // filters all the OutcomeVotes down to a list
  // of only the Votes on the selected Outcome
  const outcomeVotes = state.projects.outcomeVotes[projectId] || {}
  const allVotesArray = Object.values(outcomeVotes)
  const votes = allVotesArray.filter(function (outcomeVote) {
    return outcomeVote.outcome_address === outcomeAddress
  })
  return {
    whoami: state.whoami,
    outcomeAddress,
    votes,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    createOutcomeVote: async payload => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeVote = await projectsZomeApi.outcomeVote.create(cellId, payload)
      return dispatch(createOutcomeVote(cellIdString, outcomeVote))
    },
    updateOutcomeVote: async (entry, headerHash) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedOutcomeVote = await projectsZomeApi.outcomeVote.update(cellId, { entry, headerHash })
      return dispatch(
        updateOutcomeVote(cellIdString, updatedOutcomeVote)
        )
      },
    deleteOutcomeVote: async payload => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const deletedOutcomeVoteHash = await projectsZomeApi.outcomeVote.delete(cellId, payload)
      return dispatch(deleteOutcomeVote(cellIdString, deletedOutcomeVoteHash))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityPickerVote)
