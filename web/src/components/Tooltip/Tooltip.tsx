import React from 'react'

import TooltipTriangleOnTop from '../../images/tooltip-triangle-top.svg'
import TooltipTriangleOnBottom from '../../images/tooltip-triangle-bottom.svg'

export type TooltipProps = {
  text: string
  top?: boolean
}

const Tooltip: React.FC<TooltipProps> = ({ text, top }) => {
  return (
    <div className={`tooltip-wrapper ${top ? 'top' : ''}`}>
      {!top && (
        <img className="tooltip-triangle-on-top" src={TooltipTriangleOnTop} />
      )}
      <div className="tooltip-text-wrapper">{`${text}`}</div>
      {top && (
        <img
          className="tooltip-triangle-on-bottom"
          src={TooltipTriangleOnBottom}
        />
      )}
    </div>
  )
}

export default Tooltip
