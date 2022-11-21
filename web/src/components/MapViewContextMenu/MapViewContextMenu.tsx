import React from 'react'
import Icon from '../Icon/Icon'
import { ActionHashB64, CellIdString } from '../../types/shared'

import './MapViewContextMenu.scss'
import ContextMenu from '../ContextMenu/ContextMenu'

export type CheckboxProps = {
  projectCellId: CellIdString
  outcomeActionHash: ActionHashB64
  isCollapsed: boolean
  contextMenuCoordinate: {
    x: number
    y: number
  }
  expandOutcome: (
    projectCellId: CellIdString,
    outcomeActionHash: ActionHashB64
  ) => void
  collapseOutcome: (
    projectCellId: CellIdString,
    outcomeActionHash: ActionHashB64
  ) => void
  unsetContextMenu: () => void
}

const Checkbox: React.FC<CheckboxProps> = ({
  projectCellId,
  outcomeActionHash,
  isCollapsed,
  contextMenuCoordinate,
  expandOutcome,
  collapseOutcome,
  unsetContextMenu,
}) => {
  const wrappedCollapseOutcome = () => {
    collapseOutcome(projectCellId, outcomeActionHash)
    unsetContextMenu()
  }
  const wrappedExpandOutcome = () => {
    expandOutcome(projectCellId, outcomeActionHash)
    unsetContextMenu()
  }

  const actions = []

  if (isCollapsed) {
    actions.push({ text: 'Expand Outcome', onClick: wrappedExpandOutcome })
  } else {
    actions.push({ text: 'Collapse Outcome', onClick: wrappedCollapseOutcome })
  }

  return (
    <div
      className="map-view-context-menu"
      style={{
        top: `${contextMenuCoordinate.y}px`,
        left: `${contextMenuCoordinate.x}px`,
      }}
    >
      <ContextMenu outcomeActionHash={outcomeActionHash} actions={actions} />
    </div>
  )
}

export default Checkbox
