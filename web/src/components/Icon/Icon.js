import React from 'react'
import PropTypes from 'prop-types'
import './Icon.css'

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
      {withTooltip && <div className='icon-tooltip'>{`${tooltipText}`}</div>}
      {withTooltipTop && (
        <div className='icon-tooltip top'>{`${tooltipText}`}</div>
      )}
    </div>
  )
}

export default Icon
