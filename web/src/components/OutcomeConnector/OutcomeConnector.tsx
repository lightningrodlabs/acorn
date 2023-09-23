import React from 'react'
import './OutcomeConnector.scss'

export type OutcomeConnectorProps = {
  active: boolean
  pixelTop: number
  pixelLeft: number
  onMouseDown: (event: React.MouseEvent) => void
  onMouseUp: (event: React.MouseEvent) => void
  onMouseOver: (event: React.MouseEvent) => void
  onMouseOut: (event: React.MouseEvent) => void
}

const OutcomeConnector: React.FC<OutcomeConnectorProps> = ({
  active,
  pixelTop,
  pixelLeft,
  onMouseDown,
  onMouseUp,
  onMouseOver,
  onMouseOut,
}) => {
  return (
    <div
      className={`outcome-connector ${active ? 'active' : ''}`}
      style={{ top: `${pixelTop}px`, left: `${pixelLeft}px` }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <div className="outcome-connector-blue-dot" />
    </div>
  )
}

export default OutcomeConnector
