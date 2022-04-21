import React from 'react'
import Icon from '../Icon/Icon'
import './ButtonTabIcon.scss'

export type ButtonTabIconProps = {
  label: string
  iconName: string
  active: boolean
  onClick: () => void
}

const ButtonTabIcon: React.FC<ButtonTabIconProps> = (
  {
    label,
    iconName,
    active,
    onClick
  }
) => {
  const activeClass = active ? 'active-tab' : ''
  return (
    <div
      className={`button-tab-icon-wrapper ${activeClass}`}
      onClick={onClick}
    >
      <Icon name={iconName} size='large' className="grey" />
      {/* TODO: add tooltip text */}
      {/* {label} */}
    </div>
  )
}

export default ButtonTabIcon
