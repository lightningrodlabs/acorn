import { connect } from 'react-redux'
import {
  createGoalComment, // TODO: update to Outcome not Goal
  deleteGoalComment,
  updateGoalComment,
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
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  return {
    createGoalComment: async (payload) => {
      const outcomeComment = await projectsZomeApi.outcomeComment.create(cellId, payload)
      return dispatch(createGoalComment(cellIdString, outcomeComment))
    },
    deleteGoalComment: (payload) => {
      const outcomeComment = await projectsZomeApi.outcomeComment.delete(cellId, payload)
      return dispatch(deleteGoalComment(cellIdString, outcomeComment))
    },
    updateGoalComment: (entry, headerHash) => {
      const outcomeComment = await projectsZomeApi.outcomeComment.update(cellId, { headerHash, entry })
      return dispatch(
        updateGoalComment(cellIdString, { outcomeComment, headerHash })
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Comments)
