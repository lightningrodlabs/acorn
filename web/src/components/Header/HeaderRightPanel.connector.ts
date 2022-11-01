import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import { openExpandedView } from '../../redux/ephemeral/expanded-view/actions'
import { animatePanAndZoom } from '../../redux/ephemeral/viewport/actions'
import HeaderRightPanel from './HeaderRightPanel.component'
import { unselectAll } from '../../redux/ephemeral/selection/actions'
import { ActionHashB64 } from '../../types/shared'

function mapStateToProps(state: RootState) {
  const projectId = state.ui.activeProject
  const outcomes = state.projects.outcomes[projectId] || {}
  const outcomeComments = state.projects.outcomeComments[projectId] || {}
  const outcomeList = Object.values(outcomes)
  const commentList = Object.values(outcomeComments)
  return {
    projectId,
    outcomeList,
    commentList,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    unselectAll: () => {
      dispatch(unselectAll())
    },
    animatePanAndZoom: (outcomeActionHash: ActionHashB64) => {
      return dispatch(animatePanAndZoom(outcomeActionHash, true))
    },
    openExpandedView: (outcomeActionHash: ActionHashB64) =>
      dispatch(openExpandedView(outcomeActionHash)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(HeaderRightPanel)
