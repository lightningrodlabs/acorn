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

  // console.log(projectId)
  // console.log(!!state.agentAddress)
  // console.log(
  //   state.projects.outcomes[projectId] &&
  //     Object.values(state.projects.outcomes[projectId]).length === 0
  // )
  // console.log(!state.projects.outcomes[projectId])
  return {
    projectId,
    translate: state.ui.viewport.translate,
    zoomLevel: state.ui.viewport.scale,
    // map from an array type (the selectedOutcomes) to a simple boolean type
    // only if more than 1 (2+) outcome cards are selected
    // then show the Multi Edit Bar
    hasMultiSelection: state.ui.selection.selectedOutcomes.length > 1,
    hoveredOutcomeAddress: state.ui.hover.hoveredOutcome,
    liveMouseCoordinates: state.ui.mouse.liveCoordinate,
    mouseIsDown: state.ui.mouse.mousedown,
    showEmptyState,
    outcomeFormIsOpen: state.ui.outcomeForm.isOpen,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapView)
