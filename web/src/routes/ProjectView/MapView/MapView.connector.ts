import { connect } from 'react-redux'
import { openExpandedView } from '../../../redux/ephemeral/expanded-view/actions'
import { RootState } from '../../../redux/reducer'
import MapView from './MapView.component'

function mapDispatchToProps(dispatch) {
  return {
    openExpandedView: (address) => dispatch(openExpandedView(address)),
  }
}

function mapStateToProps(state: RootState) {
  const projectId = state.ui.activeProject
  return {
    projectId,
    // map from an array type (the selectedOutcomes) to a simple boolean type
    hasSelection: state.ui.selection.selectedOutcomes.length > 0,
    hasHover:
      state.ui.hover.hoveredOutcome &&
      state.ui.hover.hoveredOutcome !== state.ui.outcomeForm.editAddress,
    outcomeFormIsOpen: state.ui.outcomeForm.isOpen,
    translate: state.ui.viewport.translate,
    scale: state.ui.viewport.scale,
    // TODO: make this also based on whether the user has just registered (created their profile)
    showEmptyState:
      !!state.agentAddress &&
      ((state.projects.outcomes[projectId] &&
        Object.values(state.projects.outcomes[projectId]).length === 0) ||
        // project is loading
        !state.projects.outcomes[projectId]),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapView)
