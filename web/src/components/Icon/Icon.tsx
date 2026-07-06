import React, { useEffect, useState } from 'react'
import './Icon.scss'
import Tooltip from '../Tooltip/Tooltip'

function Icon({
  name,
  withBackground,
  size,
  withTooltipTop,
  withTooltip,
  tooltipText,
  className,
  onClick = () => {},
}: {
  name: string
  withBackground?: boolean
  size?: string
  withTooltipTop?: boolean
  withTooltip?: boolean
  tooltipText?: string
  className?: string
  onClick?: () => void
}) {
  let [icon, setIcon] = useState('')
  let unmounted = false

  useEffect(() => {
    // Guard against empty / extension-only names (e.g. `.svg` when a caller
    // interpolates an undefined value). The dynamic import below compiles to a
    // webpack context module, and a missing key throws an uncaught rejection.
    if (!name || name.startsWith('.')) {
      setIcon('')
      return
    }
    ;(async () => {
      try {
        // @ts-ignore
        let importedIcon = await import(`../../images/${name}`)
        if (!unmounted) {
          setIcon(importedIcon.default)
        }
      } catch (e) {
        console.warn(`Icon: could not load image "${name}"`, e)
      }
    })()
  }, [name])

  useEffect(() => {
    return function unsub() {
      unmounted = true
    }
  }, [])

  return (
    <div
      className={`
      ${withTooltip ? 'withTooltip' : ''} 
      ${withTooltipTop ? 'withTooltip' : ''} 
      ${withBackground ? 'with_background' : ''}
       icon 
       ${size} 
       ${className} `}
      onClick={onClick}
    >
      <div
        className="inner-icon"
        style={{
          maskImage: `url(${icon})`,
          WebkitMaskImage: `url(${icon})`,
        }}
      ></div>
      {withTooltip && <Tooltip text={tooltipText} />}
      {withTooltipTop && <Tooltip top text={tooltipText} />}
    </div>
  )
}

export default Icon
