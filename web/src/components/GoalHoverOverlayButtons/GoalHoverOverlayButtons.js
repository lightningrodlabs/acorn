import { connect } from 'react-redux'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import { goalWidth } from '../../drawing/dimensions'
import { unselectAll } from '../../redux/ephemeral/selection/actions'
import { openGoalForm, updateContent } from '../../redux/ephemeral/goal-form/actions'
import './GoalHoverOverlayButtons.scss'
import GoalHoverOverlayButtons from './GoalHoverOverlayButtons.component'

function mapStateToProps(state) {
  const hoveredAddress = state.ui.hover.hoveredGoal // null or an address
  const { activeProject } = state.ui
  const goals = state.projects.goals[activeProject] || {}
  const translate = state.ui.viewport.translate
  const scale = state.ui.viewport.scale

  let goalCoordinate,
    goalContent,
    cssCoordinates = {}
  if (hoveredAddress) {
    goalCoordinate = state.ui.layout[hoveredAddress]
    // Figure out where is that goal is relation to the window:
    // coordinates translation to css from canvas
    cssCoordinates = coordsCanvasToPage(
      // position it at the right of the goal, by moving to the right
      // by the width of a Goal
      { x: goalCoordinate.x + goalWidth, y: goalCoordinate.y + 6 },
      translate,
      scale
    )
    goalContent = goals[hoveredAddress].content
  }
  return {
    hoveredAddress,
    leftEdgeXPosition: cssCoordinates.x,
    topEdgeYPosition: cssCoordinates.y,
    goalCoordinate,
    goalContent,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onEditClick: (address, goalCoordinate, content) => {
      dispatch(unselectAll())
      dispatch(openGoalForm(goalCoordinate.x, goalCoordinate.y, address))
      dispatch(updateContent(content))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalHoverOverlayButtons)
