import React from 'react'
import { ActionHashB64 } from '../../types/shared'
import Icon from '../Icon/Icon'
import './ContextMenu.scss'

export type ContextMenuProps = {
  // proptypes
  menuWidth?: string
  outcomeActionHash: ActionHashB64
  actions: {
    key: string
    icon?: string
    text: string
    onClick?: (outcomeActionHash: ActionHashB64) => void
  }[]
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  // prop declarations
  menuWidth = '11rem',
  actions,
  outcomeActionHash,
}) => {
  return (
    <div className="context-menu-wrapper" style={{ width: menuWidth }}>
      <div className="context-menu-actions">
        {actions.map((action) => (
          <div
            className="context-menu-action-wrapper"
            key={action.key}
            onClick={() => action.onClick(outcomeActionHash)}
          >
            <div className="context-menu-action-icon">
              <Icon name={action.icon} className="not-hoverable white" />
            </div>
            <div className="context-menu-action-text">{action.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContextMenu
