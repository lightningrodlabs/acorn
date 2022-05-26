import { connect } from 'react-redux'
import { RootState } from '../../../redux/reducer'
import { openExpandedView } from '../../../redux/ephemeral/expanded-view/actions'
import { HeaderHashB64 } from '../../../types/shared'
import TableView, {
  TableViewConnectorDispatchProps,
  TableViewConnectorStateProps,
} from './TableView.component'
import { WireElement } from '../../../api/hdkCrud'
import { Profile } from '../../../types'
import { animatePanAndZoom } from '../../../redux/ephemeral/viewport/actions'

function mapStateToProps(state: RootState): TableViewConnectorStateProps {
  const projectId = state.ui.activeProject
  const whoAmIWireElement = state.whoami || ({} as WireElement<Profile>)
  // can be undefined, based on line above, intentionally
  const whoAmI = whoAmIWireElement.entry
  const projectTagsObject = state.projects.tags[projectId] || {}
  const projectMembers = state.projects.members[projectId] || {}
  const projectMemberProfiles = Object.keys(projectMembers)
    .map((address) => state.agents[address])
    .filter((agent) => agent)

  const projectTags = Object.values(projectTagsObject)
  return {
    whoAmI,
    projectMemberProfiles,
    projectTags,
  }
}
function mapDispatchToProps(dispatch): TableViewConnectorDispatchProps {
  return {
    openExpandedView: (headerHash: HeaderHashB64) => {
      return dispatch(openExpandedView(headerHash))
    },
    goToOutcome: (headerHash: HeaderHashB64) => {
      return dispatch(animatePanAndZoom(headerHash))
    },
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(TableView)
