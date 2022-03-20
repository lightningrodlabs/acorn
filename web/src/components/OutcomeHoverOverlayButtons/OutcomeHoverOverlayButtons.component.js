import React from 'react'
import Icon from '../Icon/Icon'
import './OutcomeHoverOverlayButtons.scss'

export default function OutcomeHoverOverlayButtons({
  hoveredAddress,
  outcomeCoordinate,
  outcomeContent,
  onEditClick,
  onExpandClick,
  leftConnectionXPosition,
  topConnectionYPosition,
}) {
  return (
    <ul
      className="hover-overlay-buttons-wrapper"
      style={{ top: `${topConnectionYPosition}px`, left: `${leftConnectionXPosition}px` }}
    >
      <li onClick={() => onExpandClick(hoveredAddress)}>
        <Icon
          name="expand.svg"
          className="not-hoverable"
          withBackground
        />
      </li>
      <li
        onClick={() => onEditClick(hoveredAddress, outcomeCoordinate, outcomeContent)}
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
