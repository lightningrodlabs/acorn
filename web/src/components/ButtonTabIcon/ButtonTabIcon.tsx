import React from 'react'
import Icon from '../Icon/Icon'
import './ButtonTabIcon.scss'

export type ButtonTabIconProps = {
  label: string
  iconName: string
  active: boolean
  onClick: () => void
}

const ButtonTabIcon: React.FC<ButtonTabIconProps> = ({
  label,
  iconName,
  active,
  onClick,
}) => {
  return (
    <div
      className={`button-tab-icon-wrapper ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {/* @ts-ignore */}
      <Icon
        name={iconName}
        size="large"
        className="grey"
        withTooltip
        tooltipText={label}
      />
      {/* TODO: add tooltip text */}
      {/* {label} */}
    </div>
  )
}

export default ButtonTabIcon
