import React from 'react'
import './PickerTemplate.scss'

import Icon from '../Icon/Icon'
import OnClickOutside from '../OnClickOutside/OnClickOutside'
import ButtonClose from '../ButtonClose/ButtonClose'

export default function PickerTemplate({
  className,
  children,
  heading,
  onClose,
  skipOnClickOutside = false,
}) {
  return (
    <OnClickOutside
      onClickOutside={() => {
        if (!skipOnClickOutside) onClose()
      }}
    >
      <div className={`${className} picker-popup`}>
        <div className="close-button">
          <ButtonClose onClick={() => onClose()} />
        </div>
        <div className="picker-popup-heading">{heading}</div>
        {children}
      </div>
    </OnClickOutside>
  )
}
