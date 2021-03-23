import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import Icon from './Icon/Icon'

import layoutFormula from '../drawing/layoutFormula'
import { coordsCanvasToPage } from '../drawing/coordinateSystems'
import { goalWidth } from '../drawing/dimensions'
import { unselectAll } from '../selection/actions'
import { openGoalForm, updateContent } from '../goal-form/actions'

function HoverOverlay(props) {
  const {
    hoveredAddress,
    goalCoord,
    goalContent,
    onEditClick,
    onExpandClick,
  } = props
  const { x, y } = props.position
  return (
    <ul className='hover_overlay' style={{ top: `${y}px`, left: `${x}px` }}>
      <li onClick={() => onExpandClick(hoveredAddress)}>
        <Icon
          name='expand.svg'
          className='white not-hoverable'
          withBackground
        />
      </li>
      <li onClick={() => onEditClick(hoveredAddress, goalCoord, goalContent)}>
        <Icon
          name='quick-edit.svg'
          className='white not-hoverable'
          withBackground
        />
      </li>
    </ul>
  )
}

HoverOverlay.propTypes = {
  hoveredAddress: PropTypes.string.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }).isRequired,
  goalCoord: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }).isRequired,
  goalContent: PropTypes.string.isRequired,
  onEditClick: PropTypes.func.isRequired,
  onExpandClick: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  const hoveredAddress = state.ui.hover.hoveredGoal // null or an address
  const { activeProject } = state.ui
  const goals = state.projects.goals[activeProject] || {}
  let position, goalCoord, goalContent
  if (hoveredAddress) {
    goalCoord = layoutFormula(state.ui.screensize.width, state)[hoveredAddress]
    position = {
      x: goalCoord.x + goalWidth,
      y: goalCoord.y + 6,
    }
    goalContent = goals[hoveredAddress].content
  }
  return {
    hoveredAddress,
    position,
    goalCoord,
    goalContent,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onEditClick: (address, goalCoord, content) => {
      dispatch(unselectAll())
      dispatch(openGoalForm(goalCoord.x, goalCoord.y, address))
      dispatch(updateContent(content))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HoverOverlay)
