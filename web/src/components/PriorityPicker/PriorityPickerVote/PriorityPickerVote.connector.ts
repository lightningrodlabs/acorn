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
import { HeaderHashB64 } from '../../../types/shared'
import { OutcomeVote } from '../../../types'

function mapStateToProps(state: RootState, ownProps) {
  const { projectId, outcomeHeaderHash } = ownProps
  // filters all the OutcomeVotes down to a list
  // of only the Votes on the selected Outcome
  const outcomeVotes = state.projects.outcomeVotes[projectId] || {}
  const allVotesArray = Object.values(outcomeVotes)
  const votes = allVotesArray.filter(function (outcomeVote) {
    return outcomeVote.outcomeHeaderHash === outcomeHeaderHash
  })
  return {
    whoami: state.whoami,
    outcomeHeaderHash,
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
      const wireElement = await projectsZomeApi.outcomeVote.create(
        cellId,
        outcomeVote
      )
      return dispatch(createOutcomeVote(cellIdString, wireElement))
    },
    updateOutcomeVote: async (
      outcomeVote: OutcomeVote,
      headerHash: HeaderHashB64
    ) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedOutcomeVote = await projectsZomeApi.outcomeVote.update(
        cellId,
        { entry: outcomeVote, headerHash }
      )
      return dispatch(updateOutcomeVote(cellIdString, updatedOutcomeVote))
    },
    deleteOutcomeVote: async (headerHash: HeaderHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      await projectsZomeApi.outcomeVote.delete(cellId, headerHash)
      return dispatch(deleteOutcomeVote(cellIdString, headerHash))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityPickerVote)
