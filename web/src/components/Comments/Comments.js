import { connect } from 'react-redux'
import {
  createOutcomeComment,
  updateOutcomeComment,
  deleteOutcomeComment,
} from '../../redux/persistent/projects/goal-comments/actions'
import Comments from './Comments.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'

function mapStateToProps(state) {
  const goalAddress = state.ui.expandedView.goalAddress
  return {
    goalAddress,
    avatarAddress: state.whoami.entry.address,
    agents: state.agents,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    createGoalComment: async (payload) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeComment = await projectsZomeApi.outcomeComment.create(
        cellId,
        payload
      )
      return dispatch(createOutcomeComment(cellIdString, outcomeComment))
    },
    updateGoalComment: async (entry, headerHash) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeComment = await projectsZomeApi.outcomeComment.update(
        cellId,
        { headerHash, entry }
      )
      return dispatch(updateOutcomeComment(cellIdString, outcomeComment))
    },
    deleteGoalComment: async (payload) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeComment = await projectsZomeApi.outcomeComment.delete(
        cellId,
        payload
      )
      return dispatch(deleteOutcomeComment(cellIdString, outcomeComment))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Comments)
