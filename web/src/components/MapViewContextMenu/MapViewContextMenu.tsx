import React, { useContext, useEffect, useState } from 'react'
import { ActionHashB64, CellIdString } from '../../types/shared'

import './MapViewContextMenu.scss'
import ContextMenu from '../ContextMenu/ContextMenu'
import ToastContext, { ShowToast } from '../../context/ToastContext'
import useContainWithinScreen from '../../hooks/useContainWithinScreen'
import { isWeaveContext, WAL } from '@theweave/api'
import { getWeaveClient } from '../../hcWebsockets'
import { CellIdWrapper } from '../../domain/cellId'
import { decodeHashFromBase64 } from '@holochain/client'

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

  const copyWALToPocket = async () => {
    const weaveClient = getWeaveClient()
    if (!weaveClient) {
      return
    }
    const cellIdWrapper = CellIdWrapper.fromCellIdString(projectCellId)
    const attachment: WAL = {
      hrl: [
        cellIdWrapper.getDnaHash(),
        decodeHashFromBase64(outcomeActionHash),
      ],
      context: 'outcome',
    }
    await weaveClient.assets.assetToPocket(attachment)
    unsetContextMenu()
    setToastState({
      id: ShowToast.Yes,
      text: 'Outcome WAL copied to Pocket',
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
  if (isWeaveContext()) {
    actions.push({
      key: 'save-to-pocket',
      icon: 'file-copy.svg',
      text: 'Add to Pocket',
      onClick: copyWALToPocket,
    })
  }

  // set menu width in pixels
  const menuWidth = 176

  // use this hook to make sure the menu is contained within the screen
  const {
    initialized,
    setItemHeight: setMenuHeight,
    renderCoordinate,
  } = useContainWithinScreen({
    initialWidth: menuWidth,
    initialHeight: 0,
    cursorCoordinate: contextMenuClickCoordinate,
  })

  return (
    <div
      className="map-view-context-menu"
      style={{
        top: `${renderCoordinate.y}px`,
        left: `${renderCoordinate.x}px`,
        // make sure the menu is not visible until the height is calculated
        visibility: initialized ? 'visible' : 'hidden',
      }}
    >
      <ContextMenu
        menuWidth={`${menuWidth}px`}
        setMenuHeight={setMenuHeight}
        outcomeActionHash={outcomeActionHash}
        actions={actions}
      />
    </div>
  )
}

export default MapViewContextMenu
