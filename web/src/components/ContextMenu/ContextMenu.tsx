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
  menuHeight: (height: number) => void
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  menuWidth,
  actions,
  outcomeActionHash,
  menuHeight,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      const height = ref.current.offsetHeight
      // send the height back to the parent
      menuHeight(height)
    }

    // if (ref.current) {
    //   const width = ref.current.offsetWidth
    //   // send the width back to the parent
    //   menuWidth(width)
    // }
  }, [ref.current])



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
