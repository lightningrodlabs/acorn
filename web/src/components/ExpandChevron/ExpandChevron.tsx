import React from 'react'
import Icon from '../Icon/Icon'
import './ExpandChevron.scss'

export type ExpandChevronProps = {
  expanded?: boolean
  onClick: () => void
}

const ExpandChevron: React.FC<ExpandChevronProps> = ({ expanded, onClick }) => {
  return (
    // TODO: add size variationss
    <div
      className={`expand-chevron-wrapper ${expanded ? 'expanded' : ''}`}
      onClick={onClick}
    >
      <Icon name="chevron-right.svg" size="small" className="light-grey" />
    </div>
  )
}

export default ExpandChevron
