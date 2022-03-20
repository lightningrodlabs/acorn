import { connect } from 'react-redux'
import {
  createOutcomeComment,
  updateOutcomeComment,
  deleteOutcomeComment,
} from '../../redux/persistent/projects/outcome-comments/actions'
import Comments from './Comments.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'

function mapStateToProps(state) {
  const outcomeAddress = state.ui.expandedView.outcomeAddress
  return {
    outcomeAddress,
    avatarAddress: state.whoami.entry.address,
    agents: state.agents,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    createOutcomeComment: async (payload) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeComment = await projectsZomeApi.outcomeComment.create(
        cellId,
        payload
      )
      return dispatch(createOutcomeComment(cellIdString, outcomeComment))
    },
    updateOutcomeComment: async (entry, headerHash) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeComment = await projectsZomeApi.outcomeComment.update(
        cellId,
        { headerHash, entry }
      )
      return dispatch(updateOutcomeComment(cellIdString, outcomeComment))
    },
    deleteOutcomeComment: async (payload) => {
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
