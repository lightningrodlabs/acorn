import React, { useState } from 'react'
import Icon from '../Icon/Icon'

import './FilterSearch.scss'

export type FilterSearchProps = {
  size: 'small' | 'medium' | 'large'
  placeholderText: string
  autoFocus?: boolean
}

const FilterSearch: React.FC<FilterSearchProps> = ({
  size = 'medium',
  placeholderText,
  autoFocus,
}) => {
  const [filterText, setFilterText] = useState('')
  return (
    <div
      className={`filter-search-wrapper ${
        size === 'large' ? 'large' : size === 'small' ? 'small' : ''
      }`}
    >
      <Icon name="search.svg" size="small" className="not-hoverable" />
      <input
        type="text"
        onChange={(e) => setFilterText(e.target.value.toLowerCase())}
        value={filterText}
        placeholder={placeholderText}
        autoFocus={autoFocus}
      />
      {filterText !== '' && (
        <div
          onClick={() => {
            setFilterText('')
          }}
          className="clear-button"
        >
          <Icon
            name="x.svg"
            size="small"
            className="light-grey not-hoverable"
            withTooltip
            tooltipText="Clear"
          />
        </div>
      )}
    </div>
  )
}

export default FilterSearch
