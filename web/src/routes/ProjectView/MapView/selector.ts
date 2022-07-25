import { createSelector } from 'reselect'
import { RootState } from '../../../redux/reducer'
import { ComputedOutcome } from '../../../types'
import { CellIdString } from '../../../types/shared'

export type InputType = {
  state: RootState
  computedOutcomesKeyed: {
    [actionHash: string]: ComputedOutcome
  }
  activeProject: CellIdString
}

const selectRenderProps = createSelector(
  ({ state }: InputType) => state.ui.activeEntryPoints,
  ({ state }: InputType) => state.ui.viewport.scale,
  ({ computedOutcomesKeyed }: InputType) => computedOutcomesKeyed,
  ({ state }: InputType) => state.ui.outcomeForm.isOpen,
  ({ state }: InputType) => state.ui.layout,
  ({ state, activeProject }: InputType) =>
    Object.values(state.projects.tags[activeProject] || {}),
  ({ state }: InputType) => state.ui.viewport.translate,
  ({ state }: InputType) => state.ui.screensize.width,
  ({ state }: InputType) => state.ui.screensize.height,
  ({ state, activeProject }: InputType) =>
    state.projects.projectMeta[activeProject],
  ({ state, activeProject }: InputType) =>
    state.projects.entryPoints[activeProject],
  ({ state, activeProject }: InputType) =>
    state.projects.outcomeMembers[activeProject],
  ({ state, activeProject }: InputType) =>
    state.projects.connections[activeProject],
  ({ state }: InputType) => state.ui.connectionConnector.fromAddress,
  ({ state }: InputType) => state.ui.connectionConnector.relation,
  ({ state }: InputType) => state.ui.outcomeForm.fromAddress,
  ({ state }: InputType) => state.ui.outcomeForm.relation,
  ({ state }: InputType) => state.ui.hover.hoveredConnection,
  ({ state }: InputType) => state.ui.selection.selectedConnections,
  ({ state }: InputType) => state.ui.selection.selectedOutcomes,
  ({ state }: InputType) => state.ui.connectionConnector.toAddress,
  ({ state }: InputType) => state.ui.mouse.liveCoordinate,
  ({ state }: InputType) => state.ui.keyboard.shiftKeyDown,
  ({ state }: InputType) => state.ui.outcomeForm.leftConnectionXPosition,
  ({ state }: InputType) => state.ui.outcomeForm.topConnectionYPosition,
  ({ state }: InputType) => state.ui.mouse.mousedown,
  ({ state }: InputType) => state.ui.mouse.coordinate,
  ({ state }: InputType) => state.ui.mouse.size,
  (
    activeEntryPoints,
    zoomLevel,
    computedOutcomesKeyed,
    outcomeFormIsOpen,
    coordinates,
    projectTags,
    translate,
    screenWidth,
    screenHeight,
    projectMeta,
    entryPoints,
    outcomeMembers,
    connections,
    connectionConnectorFromAddress,
    connectionConnectorRelation,
    outcomeFormFromActionHash,
    outcomeFormRelation,
    hoveredConnectionActionHash,
    selectedConnections,
    selectedOutcomes,
    connectionConnectorToAddress,
    mouseLiveCoordinate,
    shiftKeyDown,
    outcomeFormLeftConnectionX,
    outcomeFormTopConnectionY,
    startedSelection,
    startedSelectionCoordinate,
    currentSelectionBoxSize
  ) => {
    return {
      activeEntryPoints,
      zoomLevel,
      computedOutcomesKeyed,
      screenWidth,
      screenHeight,
      projectTags,
      translate,
      coordinates,
      projectMeta,
      entryPoints,
      outcomeMembers,
      connections,
      connectionConnectorFromAddress,
      connectionConnectorRelation,
      outcomeFormIsOpen,
      outcomeFormFromActionHash,
      outcomeFormRelation,
      hoveredConnectionActionHash,
      selectedConnections,
      selectedOutcomes,
      connectionConnectorToAddress,
      mouseLiveCoordinate,
      shiftKeyDown,
      outcomeFormLeftConnectionX,
      outcomeFormTopConnectionY,
      startedSelection,
      startedSelectionCoordinate,
      currentSelectionBoxSize,
    }
  }
)

export default selectRenderProps
