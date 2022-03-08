import { connect } from 'react-redux'
import {
  createGoalComment,
  archiveGoalComment,
  updateGoalComment,
} from '../../redux/persistent/projects/goal-comments/actions'
import Comments from './Comments.component'

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
    createGoalComment: (payload) => {
      return dispatch(createGoalComment.create({ cellIdString, payload }))
    },
    archiveGoalComment: (payload) => {
      return dispatch(archiveGoalComment.create({ cellIdString, payload }))
    },
    updateGoalComment: (entry, headerHash) => {
      return dispatch(
        updateGoalComment.create({ cellIdString, payload: { entry, headerHash } })
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Comments)
