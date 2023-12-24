import React, { useContext, useEffect, useState } from 'react'
import { ActionHashB64, CellIdString } from '../../types/shared'

import './MapViewContextMenu.scss'
import ContextMenu from '../ContextMenu/ContextMenu'
import ToastContext, { ShowToast } from '../../context/ToastContext'

export type MapViewContextMenuProps = {
  projectCellId: CellIdString
  outcomeActionHash: ActionHashB64
  outcomeStatement: string
  isCollapsed: boolean
  hasChildren: boolean
  contextMenuClickCoordinate: {
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

const MapViewContextMenu: React.FC<MapViewContextMenuProps> = ({
  projectCellId,
  outcomeActionHash,
  outcomeStatement,
  isCollapsed,
  hasChildren,
  contextMenuClickCoordinate,
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
    key: 'copy-outcome',
    icon: 'file-copy.svg',
    text: 'Copy Outcome',
    onClick: copyOutcomeStatement,
  })

  actions.push({
    key: 'copy-statement',
    icon: 'text-align-left.svg',
    text: 'Copy Statement',
    onClick: copyOutcomeStatement,
  })

  // only show this if the outcome has children
  if (hasChildren) {
    actions.push({
      key: 'copy-subtree',
      icon: 'file-copy.svg',
      text: 'Copy Subtree',
      onClick: copyOutcomeStatement,
    })
  }

  // only show this if the outcome has children
  if (hasChildren) {
    actions.push({
      key: 'export-subtree',
      icon: 'export.svg',
      text: 'Export Subtree',
      onClick: copyOutcomeStatement,
    })
  }

  // only enable if the outcome is has children BUT
  // children should not have multiple parents
  if (hasChildren && isCollapsed) {
    actions.push({
      key: 'expand',
      icon: 'expand2.svg',
      text: 'Expand Subtree',
      onClick: wrappedExpandOutcome,
    })
  }
  // only enable if the outcome is has children BUT
  // TODO: if only children do not have multiple parents
  else if (hasChildren) {
    actions.push({
      key: 'collapse',
      icon: 'collapse.svg',
      text: 'Collapse Subtree',
      onClick: wrappedCollapseOutcome,
    })
  }
  // with useState store the height of the menu
  const [menuHeight, setMenuHeight] = useState(0)
  const [renderCoordinate, setRenderCoordinate] = useState({
    x: contextMenuClickCoordinate.x,
    y: contextMenuClickCoordinate.y,
  })

  // set menu width in pixels
  const menuWidth = 176

  // when the menu height changes, deterimine weather to show the menu above or below the mouse
  // if the menu will go off the screen, move it up so that it is fully visible

  useEffect(() => {
    // if the menu will go off the screen at the bottom edge, move it up so that it is fully visible
    if (contextMenuClickCoordinate.y + menuHeight > window.innerHeight) {
      setRenderCoordinate({
        x: contextMenuClickCoordinate.x,
        y: contextMenuClickCoordinate.y - menuHeight,
      })
      // if the menu will go off the screen at the right edge, move it left so that it is fully visible
    } else if (contextMenuClickCoordinate.x + menuWidth > window.innerWidth) {
      setRenderCoordinate({
        x: contextMenuClickCoordinate.x - menuWidth,
        y: contextMenuClickCoordinate.y,
      })
      // if both x and y are off the screen, move it up and left
    } else if (
      contextMenuClickCoordinate.y + menuHeight > window.innerHeight &&
      contextMenuClickCoordinate.x + menuWidth > window.innerWidth
    ) {
      setRenderCoordinate({
        x: contextMenuClickCoordinate.x - menuWidth,
        y: contextMenuClickCoordinate.y - menuHeight,
      })
    }
  }, [menuHeight, contextMenuClickCoordinate])

  return (
    <div
      className="map-view-context-menu"
      style={{
        top: `${renderCoordinate.y}px`,
        left: `${renderCoordinate.x}px`,
        // make sure the menu is not visible until the height is calculated
        visibility: menuHeight ? 'visible' : 'hidden',
      }}
    >
      <ContextMenu
        menuWidth={`${menuWidth}px`}
        menuHeight={(height) => setMenuHeight(height)}
        outcomeActionHash={outcomeActionHash}
        actions={actions}
      />
    </div>
  )
}

export default MapViewContextMenu
