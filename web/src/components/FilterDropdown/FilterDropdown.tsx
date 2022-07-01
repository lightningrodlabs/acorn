import React, { useState } from 'react'
import Checkbox from '../Checkbox/Checkbox'
import Icon from '../Icon/Icon'
import OnClickOutside from '../OnClickOutside/OnClickOutside'

import './FilterDropdown.scss'

export type FilterDropdownProps = {
  size: 'small' | 'medium' | 'large'
  options: { innerListItem: React.ReactElement; id: any }[]
  selectedOptions: any[]
  onChange: (newSelectedOptions: any[]) => void
  icon: React.ReactElement
  text: string
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  size = 'medium',
  selectedOptions,
  onChange,
  icon,
  text,
  options,
}) => {
  const [isOpenDropdownMenu, setIsOpenDropdownMenu] = useState(false)
  return (
    <OnClickOutside onClickOutside={() => setIsOpenDropdownMenu(false)}>
      <div className="filter-dropdown-wrapper-with-dropdown">
        {/* Selection options count badge */}
        {selectedOptions.length > 0 && (
          <div className="filter-selection-count">{selectedOptions.length}</div>
        )}
        <div
          onClick={() => setIsOpenDropdownMenu(!isOpenDropdownMenu)}
          className={`filter-dropdown-wrapper ${
            isOpenDropdownMenu || selectedOptions.length > 0 ? 'focused' : ''
          } 
      ${size === 'large' ? 'large' : size === 'small' ? 'small' : ''}`}
        >
          <div className="filter-dropdown-icon">{icon}</div>
          <div className="filter-dropdown-text">{text}</div>

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
          <div className="filter-dropdown-menu">
            {options.map((option) => {
              const isChecked = selectedOptions.includes(option.id)
              const onSelectOption = (isChecked: boolean) => {
                if (isChecked && !selectedOptions.includes(option.id)) {
                  // add it, since its not there
                  onChange([...selectedOptions, option.id])
                } else if (!isChecked && selectedOptions.includes(option.id)) {
                  // remove it, since its there and shouldn't be
                  onChange(selectedOptions.filter((id) => id !== option.id))
                }
              }
              return (
                <div
                  className="filter-dropdown-menu-option"
                  onClick={() => onSelectOption(!isChecked)}
                >
                  <Checkbox size="small" isChecked={isChecked} />
                  {option.innerListItem}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </OnClickOutside>
  )
}

export default FilterDropdown
