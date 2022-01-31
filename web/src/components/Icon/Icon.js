import React from 'react'
import PropTypes from 'prop-types'
import './Icon.css'
import Tooltip from '../Tooltip/Tooltip'

function Icon ({
  name,
  withBackground,
  size,
  withTooltipTop,
  withTooltip,
  tooltipText,
  className,
  onClick = () => {},
}) {
  return (
    <div
      className={`
      ${withTooltip ? 'withTooltip' : ''} 
      ${withTooltipTop ? 'withTooltip' : ''} 
      ${withBackground ? 'with_background' : ''}
       icon 
       ${size} 
       ${className} `}
      onClick={onClick}>
      <div
        className='inner-icon'
        style={{
          maskImage: `url(img/${name})`,
          WebkitMaskImage: `url(img/${name})`,
        }}></div>
        {withTooltip && <Tooltip text={tooltipText} />}
      {/* {withTooltip && <div className='tooltip-wrapper'>{`${tooltipText}`}</div>} */}
      {withTooltipTop && (
        <Tooltip top text={tooltipText} />
      )}
      
      {/* {withTooltipTop && (
        <div className='tooltip-wrapper top'>{`${tooltipText}`}</div>
      )} */}
    </div>
  )
}

export default Icon
