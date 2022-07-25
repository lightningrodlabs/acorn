import { connect } from 'react-redux'
import { RootState } from '../../../redux/reducer'
import {
  createOutcomeVote,
  deleteOutcomeVote,
  updateOutcomeVote,
} from '../../../redux/persistent/projects/outcome-votes/actions'
import PriorityPickerVote from './PriorityPickerVote.component'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'
import { cellIdFromString } from '../../../utils'
import { ActionHashB64 } from '../../../types/shared'
import { OutcomeVote } from '../../../types'

function mapStateToProps(state: RootState, ownProps) {
  const { projectId, outcomeActionHash } = ownProps
  // filters all the OutcomeVotes down to a list
  // of only the Votes on the selected Outcome
  const outcomeVotes = state.projects.outcomeVotes[projectId] || {}
  const allVotesArray = Object.values(outcomeVotes)
  const votes = allVotesArray.filter(function (outcomeVote) {
    return outcomeVote.outcomeActionHash === outcomeActionHash
  })
  return {
    whoami: state.whoami,
    outcomeActionHash,
    votes,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    createOutcomeVote: async (outcomeVote: OutcomeVote) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const wireRecord = await projectsZomeApi.outcomeVote.create(
        cellId,
        outcomeVote
      )
      return dispatch(createOutcomeVote(cellIdString, wireRecord))
    },
    updateOutcomeVote: async (
      outcomeVote: OutcomeVote,
      actionHash: ActionHashB64
    ) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedOutcomeVote = await projectsZomeApi.outcomeVote.update(
        cellId,
        { entry: outcomeVote, actionHash }
      )
      return dispatch(updateOutcomeVote(cellIdString, updatedOutcomeVote))
    },
    deleteOutcomeVote: async (actionHash: ActionHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      await projectsZomeApi.outcomeVote.delete(cellId, actionHash)
      return dispatch(deleteOutcomeVote(cellIdString, actionHash))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityPickerVote)
