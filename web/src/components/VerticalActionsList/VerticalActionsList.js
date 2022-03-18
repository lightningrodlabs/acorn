import { connect } from 'react-redux'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import { goalWidth } from '../../drawing/dimensions'
import { deleteOutcomeFully, updateOutcome } from '../../redux/persistent/projects/goals/actions'
import VerticalActionsList from './VerticalActionsList.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'

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
    onArchiveClick: async (payload) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const fullyDeletedOutcome = await projectsZomeApi.outcome.deleteOutcomeFully(cellId, payload)
      return dispatch(deleteOutcomeFully(cellIdString, fullyDeletedOutcome))
    },
    updateGoal: async (entry, headerHash) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedOutcome = await projectsZomeApi.outcome.update(cellId, { headerHash, entry })
      return dispatch(
        updateOutcome(cellIdString, updatedOutcome)
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VerticalActionsList)
