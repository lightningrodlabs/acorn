import React, { useState } from 'react'
import Icon from '../Icon/Icon'

import './SelectDropdown.scss'

export type SelectDropdownProps = {
  size: 'small' | 'medium' | 'large'
  selectedOptionId: string
  options: { icon: React.ReactElement; text: string; id: string }[]
  onSelect: (id: string) => void
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  selectedOptionId,
  size = 'medium',
  options,
  onSelect,
}) => {
  const [isOpenDropdownMenu, setIsOpenDropdownMenu] = useState(false)
  const selectedOption = options.find(
    (option) => option.id === selectedOptionId
  )
  const selectedText = selectedOption.text
  const selectedIcon = selectedOption.icon
  const onClickOption = (id: string) => {
    setIsOpenDropdownMenu(false)
    onSelect(id)
  }
  return (
    <div className="select-dropdown-wrapper">
      {/* Main dropdown button */}
      <div
        onClick={() => setIsOpenDropdownMenu(!isOpenDropdownMenu)}
        className={`select-dropdown-button 
        ${isOpenDropdownMenu ? 'focused' : ''}  
        ${size === 'small' ? 'small' : size === 'large' ? 'large' : ''}`}
      >
        <div className="select-dropdown-selected-option">
          <div className="select-dropdown-icon">{selectedIcon}</div>
          <div className="select-dropdown-text">{selectedText}</div>
        </div>
        <div className="select-dropdown-chevron">
          <Icon
            name={isOpenDropdownMenu ? 'chevron-up.svg' : 'chevron-down.svg'}
            size="small"
            className="light-grey not-hoverable"
          />
        </div>
      </div>
      {/* The dropdown part of the dropdown menu */}
      {isOpenDropdownMenu && (
        <div className="select-dropdown-menu">
          {options.map((option) => (
            <div
              onClick={() => onClickOption(option.id)}
              className={`select-dropdown-menu-option ${
                size === 'small' ? 'small' : size === 'large' ? 'large' : ''
              }`}
            >
              <div className="select-dropdown-menu-option-icon">
                {option.icon}
              </div>
              <div className="select-dropdown-menu-option-text">
                {option.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SelectDropdown
