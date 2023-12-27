import React, { useEffect, useRef } from 'react'
import { ActionHashB64 } from '../../types/shared'
import Icon from '../Icon/Icon'
import './ContextMenu.scss'

export type ContextMenuProps = {
  // proptypes
  menuWidth: string
  outcomeActionHash: ActionHashB64
  actions: {
    key: string
    icon?: string
    text: string
    onClick?: (outcomeActionHash: ActionHashB64) => void
  }[]
  setMenuHeight: (height: number) => void
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  menuWidth,
  actions,
  outcomeActionHash,
  setMenuHeight,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      const height = ref.current.offsetHeight
      // send the height back to the parent
      setMenuHeight(height)
    }
  }, [ref.current])

  // adjust height when number of actions changes
  useEffect(() => {
    if (ref.current) {
      const height = ref.current.offsetHeight
      // send the height back to the parent
      setMenuHeight(height)
    }
  }, [actions.length])

  return (
    <div
      className="context-menu-wrapper"
      style={{ width: menuWidth }}
      ref={ref}
    >
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
