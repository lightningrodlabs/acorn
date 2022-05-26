import { connect } from 'react-redux'
import { RootState } from '../../../redux/reducer'
import MapView, { MapViewProps } from './MapView.component'

function mapDispatchToProps(dispatch) {
  return {}
}

function mapStateToProps(state: RootState): MapViewProps {
  const projectId = state.ui.activeProject

  // TODO: make this also based on whether the user has just registered (created their profile)
  const showEmptyState =
    !!state.agentAddress &&
    ((state.projects.outcomes[projectId] &&
      Object.values(state.projects.outcomes[projectId]).length === 0) ||
      // project is loading
      !state.projects.outcomes[projectId])
  return {
    projectId,
    translate: state.ui.viewport.translate,
    zoomLevel: state.ui.viewport.scale,
    // map from an array type (the selectedOutcomes) to a simple boolean type
    hasSelection: state.ui.selection.selectedOutcomes.length > 0,
    showEmptyState,
    outcomeFormIsOpen: state.ui.outcomeForm.isOpen,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapView)
