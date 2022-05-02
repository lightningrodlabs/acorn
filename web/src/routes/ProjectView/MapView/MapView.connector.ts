import { connect } from 'react-redux'
import { RootState } from '../../../redux/reducer'
import MapView, { MapViewProps } from './MapView.component'

function mapDispatchToProps(dispatch) {
  return {}
}

function mapStateToProps(state: RootState): MapViewProps {
  const projectId = state.ui.activeProject
  const projectTags = Object.values(state.projects.tags[projectId] || {})
  const connections = state.projects.connections[projectId]
  const outcomeMembers = state.projects.outcomeMembers[projectId]
  const entryPoints = state.projects.entryPoints[projectId]
  const projectMeta = state.projects.projectMeta[projectId]
  return {
    projectId,
    connectionConnectorFromAddress: state.ui.connectionConnector.fromAddress,
    connectionConnectorRelation: state.ui.connectionConnector.relation,
    connectionConnectorToAddress: state.ui.connectionConnector.toAddress,
    mouseLiveCoordinate: state.ui.mouse.liveCoordinate,
    shiftKeyDown: state.ui.keyboard.shiftKeyDown,
    outcomeFormLeftConnectionX: state.ui.outcomeForm.leftConnectionXPosition,
    outcomeFormTopConnectionY: state.ui.outcomeForm.topConnectionYPosition,
    startedSelection: state.ui.mouse.mousedown,
    startedSelectionCoordinate: state.ui.mouse.coordinate,
    currentSelectionBoxSize: state.ui.mouse.size,

    projectTags,
    connections,
    outcomeMembers,
    entryPoints,
    projectMeta,
    activeEntryPoints: state.ui.activeEntryPoints,
    // map from an array type (the selectedOutcomes) to a simple boolean type
    hasSelection: state.ui.selection.selectedOutcomes.length > 0,
    outcomeFormIsOpen: state.ui.outcomeForm.isOpen,
    outcomeFormFromHeaderHash: state.ui.outcomeForm.fromAddress,
    outcomeFormRelation: state.ui.outcomeForm.relation,
    hoveredConnectionHeaderHash: state.ui.hover.hoveredConnection,
    selectedConnections: state.ui.selection.selectedConnections,
    selectedOutcomes: state.ui.selection.selectedOutcomes,
    translate: state.ui.viewport.translate,
    zoomLevel: state.ui.viewport.scale,
    screenHeight: state.ui.screensize.height,
    screenWidth: state.ui.screensize.width,
    coordinates: state.ui.layout,
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
