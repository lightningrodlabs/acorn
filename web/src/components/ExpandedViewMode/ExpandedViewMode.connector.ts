import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import ExpandedViewMode, {
  ExpandedViewModeConnectorProps,
  ExpandedViewModeOwnProps,
} from './ExpandedViewMode.component'

function mapStateToProps(
  state: RootState,
  ownProps: ExpandedViewModeOwnProps
): ExpandedViewModeConnectorProps {
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
    commentCount: comments.length,
  }
}

export default connect(mapStateToProps)(ExpandedViewMode)
