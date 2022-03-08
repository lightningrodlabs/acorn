import { connect } from 'react-redux'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import { goalWidth } from '../../drawing/dimensions'
import { archiveGoalFully, updateGoal } from '../../redux/persistent/projects/goals/actions'
import VerticalActionsList from './VerticalActionsList.component'

function mapStateToProps(state, ownProps) {
  // goal headerHash
  const goalAddress = state.ui.goalForm.editAddress
  // project ID
  const { projectId } = ownProps
  const goals = state.projects.goals[projectId] || {}

  // Figure out where is that goal on the canvas:
  // figure out where on the canvas the goal being edited is
  // located, according to the canvas coordinate system
  // x, y
  const width = state.ui.screensize.width
  const goalCoordinate = state.ui.layout[goalAddress]

  // Figure out where is that goal is relation to the window:
  // coordinates translation to css from canvas
  const translate = state.ui.viewport.translate
  const scale = state.ui.viewport.scale
  // position it at the right of the goal, by moving to the right
  // by the width of a Goal
  const cssCoordinates = coordsCanvasToPage(
    { x: (goalCoordinate.x + goalWidth), y: goalCoordinate.y },
    translate,
    scale
  )

  return {
    agentAddress: state.agentAddress,
    goalAddress,
    goal: goals[goalAddress],
    leftEdgeXPosition: cssCoordinates.x,
    topEdgeYPosition: cssCoordinates.y,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    onArchiveClick: (payload) => {
      return dispatch(archiveGoalFully.create({ cellIdString, payload }))
    },
    updateGoal: (entry, headerHash) => {
      return dispatch(
        updateGoal.create({ cellIdString, payload: { headerHash, entry } })
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VerticalActionsList)
