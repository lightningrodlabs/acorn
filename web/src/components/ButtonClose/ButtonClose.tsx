import React from 'react'
import Icon from '../Icon/Icon'

import './ButtonClose.scss'

export type ButtonCloseProps = {
  size: 'small' | 'medium' | 'large'
  onClick: () => void
}

const ButtonClose: React.FC<ButtonCloseProps> = ({
  size = 'medium',
  onClick,
}) => {
  return (
    <div className="button-close-wrapper">
      {/* @ts-ignore */}
      <Icon
        onClick={onClick}
        name="x.svg"
        size="small-close"
        className="light-grey"
      />
    </div>
  )
}

export default ButtonClose
