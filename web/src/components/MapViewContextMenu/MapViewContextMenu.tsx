import React, { useContext } from 'react'
import { ActionHashB64, CellIdString } from '../../types/shared'

import './MapViewContextMenu.scss'
import ContextMenu from '../ContextMenu/ContextMenu'
import ToastContext, { ShowToast } from '../../context/ToastContext'

export type CheckboxProps = {
  projectCellId: CellIdString
  outcomeActionHash: ActionHashB64
  outcomeStatement: string
  isCollapsed: boolean
  hasChildren: boolean
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
  outcomeStatement,
  isCollapsed,
  hasChildren,
  contextMenuCoordinate,
  expandOutcome,
  collapseOutcome,
  unsetContextMenu,
}) => {

// pull in the toast context
const { setToastState } = useContext(ToastContext)

  const wrappedCollapseOutcome = () => {
    collapseOutcome(projectCellId, outcomeActionHash)
    unsetContextMenu()
  }
  const wrappedExpandOutcome = () => {
    expandOutcome(projectCellId, outcomeActionHash)
    unsetContextMenu()
  }
  const copyOutcomeStatement = () => {
    navigator.clipboard.writeText(outcomeStatement)
    unsetContextMenu()
    setToastState({
      id: ShowToast.Yes,
      text: 'Outcome statement copied to clipboard',
      type: 'confirmation',
    })
  }

  const actions = []
  actions.push({
    key: 'copy-statement',
    icon: 'text-align-left.svg',
    text: 'Copy Statement',
    onClick: copyOutcomeStatement,
  })

  if (hasChildren && isCollapsed) {
    actions.push({
      key: 'expand',
      icon: 'leaf.svg',
      text: 'Expand Outcome',
      onClick: wrappedExpandOutcome,
    })
  }
  // DISABLED: collapsing outcomes
  // else if (hasChildren) {
  // actions.push({
  //   key: 'collapse',
  //   icon: 'leaf.svg',
  //   text: 'Collapse Outcome',
  //   onClick: wrappedCollapseOutcome,
  // })
  // }

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
