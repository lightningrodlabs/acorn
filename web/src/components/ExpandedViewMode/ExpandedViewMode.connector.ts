import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import { updateOutcome } from '../../redux/persistent/projects/outcomes/actions'
import { deleteOutcomeMember } from '../../redux/persistent/projects/outcome-members/actions'
import {
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
} from '../../redux/ephemeral/outcome-editing/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import { HeaderHashB64 } from '../../types/shared'
import { Outcome } from '../../types'
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

function mapDispatchToProps(dispatch, ownProps: ExpandedViewModeOwnProps) {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpandedViewMode)
