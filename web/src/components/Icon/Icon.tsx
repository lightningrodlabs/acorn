import React, { useEffect, useState } from 'react'
import './Icon.scss'
import Tooltip from '../Tooltip/Tooltip'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/reducer'

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

  const theme = useSelector(
    (state: RootState) => state.ui.localPreferences.color
  )

  useEffect(() => {
    ;(async () => {
      // @ts-ignore
      let importedIcon = await import(`../../images/${name}`)
      if (!unmounted) {
        setIcon(importedIcon.default)
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
        className={`inner-icon ${theme}`}
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
