import { connect } from 'react-redux'
import {
  createOutcomeComment,
  updateOutcomeComment,
  deleteOutcomeComment,
} from '../../../../../redux/persistent/projects/outcome-comments/actions'
import ProjectsZomeApi from '../../../../../api/projectsApi'
import { getAppWs } from '../../../../../hcWebsockets'
import { cellIdFromString } from '../../../../../utils'
import { RootState } from '../../../../../redux/reducer'
import { HeaderHashB64 } from '../../../../../types/shared'
import { OutcomeComment } from '../../../../../types'
import EvComments, {
  EvCommentsConnectorStateProps,
  EvCommentsOwnProps,
} from './EvComments.component'

function mapStateToProps(
  state: RootState,
  ownProps: EvCommentsOwnProps
): EvCommentsConnectorStateProps {
  const { projectId } = ownProps
  const outcomeHeaderHash = state.ui.expandedView.outcomeHeaderHash
  const outcomeComments = state.projects.outcomeComments[projectId] || {}

  let comments = []
  if (outcomeHeaderHash) {
    comments = Object.values(outcomeComments).filter(
      (outcomeComment) =>
        outcomeComment.outcomeHeaderHash ===
        state.ui.expandedView.outcomeHeaderHash
    )
  }

  return {
    outcomeHeaderHash,
    activeAgentPubKey: state.agentAddress,
    profiles: state.agents,
    comments,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    createOutcomeComment: async (payload: OutcomeComment) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeComment = await projectsZomeApi.outcomeComment.create(
        cellId,
        payload
      )
      return dispatch(createOutcomeComment(cellIdString, outcomeComment))
    },
    updateOutcomeComment: async (
      entry: OutcomeComment,
      headerHash: HeaderHashB64
    ) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeComment = await projectsZomeApi.outcomeComment.update(
        cellId,
        { headerHash, entry }
      )
      return dispatch(updateOutcomeComment(cellIdString, outcomeComment))
    },
    deleteOutcomeComment: async (headerHash: HeaderHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      await projectsZomeApi.outcomeComment.delete(cellId, headerHash)
      return dispatch(deleteOutcomeComment(cellIdString, headerHash))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EvComments)
