import React from 'react'
import './PickerTemplate.scss'

import Icon from '../Icon/Icon'
import OnClickOutside from '../OnClickOutside/OnClickOutside'

export default function PickerTemplate({
  className,
  children,
  heading,
  onClose,
}) {
  return (
    <OnClickOutside onClickOutside={onClose}>
      <div className={`${className} picker-popup`}>
        <Icon
          className='light-grey vertical_action_close'
          name='x.svg'
          size='very-small-close'
          onClick={() => onClose()}
        />
        <div className='picker-popup-heading'>{heading}</div>
        {children}
      </div>
    </OnClickOutside>
  )
}
