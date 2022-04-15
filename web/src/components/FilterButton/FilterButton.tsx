import React from 'react'
import Checkbox from '../Checkbox/Checkbox'
import Icon from '../Icon/Icon'

import './FilterButton.scss'

export type FilterButtonProps = {
  size: 'small' | 'medium' | 'large'
  isSelected: boolean
  onChange: (newState: boolean) => void
  icon: React.ReactElement
  text: string
}

const FilterButton: React.FC<FilterButtonProps> = ({
  size = 'medium',
  isSelected,
  onChange,
  icon,
  text,
}) => {
  return (
    <div
      className={`filter-button-wrapper ${isSelected ? 'selected' : ''} 
      ${size === 'large' ? 'large' : size === 'small' ? 'small' : ''}`}
      onClick={() => onChange(!isSelected)}
    >
      <div className="filter-button-icon">{icon}</div>
      <div className="filter-button-text">{text}</div>
    </div>
  )
}

export default FilterButton
