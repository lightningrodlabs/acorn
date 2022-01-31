import React from 'react'

export type TooltipProps = {
  text: string
  top?: boolean
}

const Tooltip: React.FC<TooltipProps> = ({ text, top }) => {
  return (
    <div className={`tooltip-wrapper ${top ? 'top' : ''}`}>
      {!top && (
        <img
          className="tooltip-triangle-on-top"
          src="img/tooltip-triangle-top.svg"
        />
      )}
      <div className="tooltip-text-wrapper">{`${text}`}</div>
      {top && (
        <img
          className="tooltip-triangle-on-bottom"
          src="img/tooltip-triangle-bottom.svg"
        />
      )}
    </div>
  )
}

export default Tooltip
