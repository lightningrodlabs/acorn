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
import { ActionHashB64 } from '../../../../../types/shared'
import { OutcomeComment } from '../../../../../types'
import EvComments, {
  EvCommentsConnectorStateProps,
  EvCommentsOwnProps,
} from './EvComments.component'
import { selectMemberProfilesOfProject } from '../../../../../redux/persistent/projects/members/select'
import _ from 'lodash'

function mapStateToProps(
  state: RootState,
  ownProps: EvCommentsOwnProps
): EvCommentsConnectorStateProps {
  const { projectId } = ownProps
  const outcomeActionHash = state.ui.expandedView.outcomeActionHash
  const outcomeComments = state.projects.outcomeComments[projectId] || {}

  const profiles = selectMemberProfilesOfProject(state, projectId);

  let comments = []
  if (outcomeActionHash) {
    comments = Object.values(outcomeComments).filter(
      (outcomeComment) =>
        outcomeComment.outcomeActionHash ===
        state.ui.expandedView.outcomeActionHash
    )
  }

  return {
    outcomeActionHash,
    activeAgentPubKey: state.agentAddress,
    profiles: _.keyBy(profiles, 'agentPubKey'),
    comments,
  }
}

function mapDispatchToProps(dispatch: any, ownProps: EvCommentsOwnProps) {
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
      actionHash: ActionHashB64
    ) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeComment = await projectsZomeApi.outcomeComment.update(
        cellId,
        { actionHash, entry }
      )
      return dispatch(updateOutcomeComment(cellIdString, outcomeComment))
    },
    deleteOutcomeComment: async (actionHash: ActionHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      await projectsZomeApi.outcomeComment.delete(cellId, actionHash)
      return dispatch(deleteOutcomeComment(cellIdString, actionHash))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EvComments)
