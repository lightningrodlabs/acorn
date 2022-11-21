import { connect } from 'react-redux'
import {
  collapseOutcome,
  expandOutcome,
} from '../../../redux/ephemeral/collapsed-outcomes/actions'
import { unsetContextMenu } from '../../../redux/ephemeral/mouse/actions'
import { RootState } from '../../../redux/reducer'
import MapView, {
  MapViewDispatchProps,
  MapViewStateProps,
} from './MapView.component'

function mapDispatchToProps(dispatch): MapViewDispatchProps {
  return {
    expandOutcome: (projectCellId, outcomeActionHash) => {
      return dispatch(expandOutcome(projectCellId, outcomeActionHash))
    },
    collapseOutcome: (projectCellId, outcomeActionHash) => {
      return dispatch(collapseOutcome(projectCellId, outcomeActionHash))
    },
    unsetContextMenu: () => {
      return dispatch(unsetContextMenu())
    },
  }
}

function mapStateToProps(state: RootState): MapViewStateProps {
  const projectId = state.ui.activeProject
  const collapsedOutcomes =
    state.ui.collapsedOutcomes.collapsedOutcomes[projectId] || {}

  // TODO: make this also based on whether the user has just registered (created their profile)
  const showEmptyState =
    !!state.agentAddress &&
    ((state.projects.outcomes[projectId] &&
      Object.values(state.projects.outcomes[projectId]).length === 0) ||
      // project is loading
      !state.projects.outcomes[projectId])

  const contextMenuOutcomeActionHash =
    state.ui.mouse.contextMenu.outcomeActionHash

  const contextMenuOutcomeIsCollapsed = contextMenuOutcomeActionHash
    ? collapsedOutcomes[contextMenuOutcomeActionHash]
    : false

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
    contextMenuCoordinate: state.ui.mouse.contextMenu.coordinate,
    contextMenuOutcomeActionHash,
    contextMenuOutcomeIsCollapsed,
    mouseIsDown: state.ui.mouse.mousedown,
    showEmptyState,
    outcomeFormIsOpen: state.ui.outcomeForm.isOpen,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapView)
