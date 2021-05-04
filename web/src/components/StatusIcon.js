import React from 'react'
import PropTypes from 'prop-types'

function StatusIcon({
  status,
  selected,
  onClick,
  hideTooltip,
  size = 'small',
  className = '',
  notHoverable,
}) {
  const classList = `status_color tooltip_container status_color_${size} bg_${status} ${
    selected ? 'has_status' : ''
  } ${onClick ? 'can_click' : ''} ${className} 
  ${notHoverable ? 'not-hoverable' : ''}`

  // change camel case from spaced words e.g. "InReview" to "In Review"
  const readable = status.replace(/([A-Z])/g, ' $1')

  return (
    <div className={classList} onClick={() => onClick(status)}>
      {!hideTooltip && <div className={`tooltip bg_${status}`}>{readable}</div>}
    </div>
  )
}

StatusIcon.propTypes = {
  status: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  hideTooltip: PropTypes.bool,
  size: PropTypes.string,
}

export default StatusIcon
