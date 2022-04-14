import React, { useEffect, useState } from 'react'
import './Icon.scss'
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
  let [icon, setIcon] = useState('');

  useEffect(() => {
    (async () => {
      let importedIcon = await import(`../../images/${name}`);
      setIcon(importedIcon.default);
    })()
  }, [name]);

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
          maskImage: `url(${icon})`,
          WebkitMaskImage: `url(${icon})`,
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
