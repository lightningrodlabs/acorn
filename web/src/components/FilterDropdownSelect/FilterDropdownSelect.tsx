import React, { useState } from 'react'
import Icon from '../Icon/Icon'
import OnClickOutside from '../OnClickOutside/OnClickOutside'

import './FilterDropdownSelect.scss'

export type FilterDropdownSelectProps = {
  size: 'small' | 'medium' | 'large'
  options: { icon?: React.ReactElement; text: string; id: string }[]
  selectedOptionId: string
  onSelect: (id: string) => void
}

const FilterDropdownSelect: React.FC<FilterDropdownSelectProps> = ({
  size = 'medium',
  selectedOptionId,
  onSelect,
  options,
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
    <OnClickOutside onClickOutside={() => setIsOpenDropdownMenu(false)}>
      <div className="filter-dropdown-select-wrapper-with-dropdown">
        {/* Selection options count badge */}
        {/* {selectedOptions.length > 0 && (
          <div className="filter-selection-count">{selectedOptions.length}</div>
        )} */}
        <div
          onClick={() => setIsOpenDropdownMenu(!isOpenDropdownMenu)}
          className={`filter-dropdown-select-wrapper ${
            isOpenDropdownMenu ? 'focused' : ''
          } 
      ${size === 'large' ? 'large' : size === 'small' ? 'small' : ''}`}
        >
          <div className="filter-dropdown-selected-option">
            {selectedIcon && (
              <div className="filter-dropdown-icon">{selectedIcon}</div>
            )}
            <div className="filter-dropdown-text">{selectedText}</div>
          </div>

          <div className="filter-dropdown-chevron">
            {/* @ts-ignore */}
            <Icon
              name={isOpenDropdownMenu ? 'chevron-up.svg' : 'chevron-down.svg'}
              size="small"
              className="light-grey not-hoverable"
            />
          </div>
        </div>
        {/* The dropdown part of the dropdown menu */}
        {isOpenDropdownMenu && (
          <div className="filter-dropdown-select-menu">
            <div className="select-dropdown-menu">
              {options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => onClickOption(option.id)}
                  className={`filter-dropdown-menu-option ${
                    size === 'small' ? 'small' : size === 'large' ? 'large' : ''
                  }`}
                >
                  {option.icon && (
                    <div className="filter-dropdown-icon">{option.icon}</div>
                  )}

                  <div className="filter-dropdown-text">{option.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </OnClickOutside>
  )
}

export default FilterDropdownSelect
