import React from 'react'
import Icon from '../Icon/Icon'
import './GoalHoverOverlayButtons.scss'

export default function GoalHoverOverlayButtons({
  hoveredAddress,
  goalCoordinate,
  goalContent,
  onEditClick,
  onExpandClick,
  leftEdgeXPosition,
  topEdgeYPosition,
}) {
  return (
    <ul
      className="hover-overlay-buttons-wrapper"
      style={{ top: `${topEdgeYPosition}px`, left: `${leftEdgeXPosition}px` }}
    >
      <li onClick={() => onExpandClick(hoveredAddress)}>
        <Icon
          name="expand.svg"
          className="not-hoverable"
          withBackground
        />
      </li>
      <li
        onClick={() => onEditClick(hoveredAddress, goalCoordinate, goalContent)}
      >
        <Icon
          name="pencil.svg"
          className="not-hoverable"
          withBackground
        />
      </li>
    </ul>
  )
}
