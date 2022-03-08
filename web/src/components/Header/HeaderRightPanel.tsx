import { connect } from 'react-redux'
import { openExpandedView } from '../../redux/ephemeral/expanded-view/actions'
import { animatePanAndZoom } from '../../redux/ephemeral/viewport/actions'
import HeaderRightPanel from './HeaderRightPanel.component'

function mapStateToProps(state) {
  const projectId = state.ui.activeProject
  const goals = state.projects.goals[projectId] || {}
  const goalComments = state.projects.goalComments[projectId] || {}
  const goalList = Object.values(goals)
  const commentList = Object.values(goalComments)
  return {
    projectId,
    goalList,
    commentList,
  }
}
function mapDispatchToProps(dispatch) {
  return {
    animatePanAndZoom: (address) => {
      return dispatch(animatePanAndZoom(address))
    },
    openExpandedView: (address) => dispatch(openExpandedView(address)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(HeaderRightPanel)
