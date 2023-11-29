import React from 'react'
import Icon from '../Icon/Icon'

import './ButtonClose.scss'

export type ButtonCloseProps = {
  size: 'small' | 'medium' | 'large'
  onClick: () => void
  disabled?: boolean
}

const ButtonClose: React.FC<ButtonCloseProps> = ({
  size = 'medium',
  onClick,
  disabled,
}) => {
  return (
    <button className="button-close-wrapper" onClick={onClick} disabled={disabled}>
      {/* @ts-ignore */}
      <Icon
        name="x.svg"
        size="small-close"
        className={`light-grey ${size == 'small' ? 'small' : ''}`}
      />
    </button>
  )
}

export default ButtonClose
