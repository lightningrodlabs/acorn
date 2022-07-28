import { connect } from 'react-redux'
import { RootState } from '../../../redux/reducer'
import { openExpandedView } from '../../../redux/ephemeral/expanded-view/actions'
import selectProjectMembersPresent from '../../../redux/persistent/projects/realtime-info-signal/select'
import { ActionHashB64 } from '../../../types/shared'
import TableView, {
  TableViewConnectorDispatchProps,
  TableViewConnectorStateProps,
} from './TableView.component'
import { WireRecord } from '../../../api/hdkCrud'
import { Profile } from '../../../types'
import { animatePanAndZoom } from '../../../redux/ephemeral/viewport/actions'

function mapStateToProps(state: RootState): TableViewConnectorStateProps {
  const projectId = state.ui.activeProject
  const whoAmIWireRecord = state.whoami || ({} as WireRecord<Profile>)
  // can be undefined, based on line above, intentionally
  const whoAmI = whoAmIWireRecord.entry
  const projectTagsObject = state.projects.tags[projectId] || {}
  const projectMembers = state.projects.members[projectId] || {}
  const projectMemberProfiles = Object.keys(projectMembers)
    .map((address) => state.agents[address])
    .filter((agent) => agent)

  const presentMembers = projectId
    ? selectProjectMembersPresent(state, projectId)
    : []

  const projectTags = Object.values(projectTagsObject)
  return {
    whoAmI,
    presentMembers,
    projectMemberProfiles,
    projectTags,
  }
}
function mapDispatchToProps(dispatch): TableViewConnectorDispatchProps {
  return {
    openExpandedView: (actionHash: ActionHashB64) => {
      return dispatch(openExpandedView(actionHash))
    },
    goToOutcome: (actionHash: ActionHashB64) => {
      return dispatch(animatePanAndZoom(actionHash))
    },
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(TableView)
