import { connect } from 'react-redux'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import { outcomeWidth } from '../../drawing/dimensions'
import { deleteOutcomeFully, updateOutcome } from '../../redux/persistent/projects/outcomes/actions'
import VerticalActionsList from './VerticalActionsList.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'

function mapStateToProps(state, ownProps) {
  // outcome headerHash
  const outcomeHeaderHash = state.ui.outcomeForm.editAddress
  // project ID
  const { projectId } = ownProps
  const outcomes = state.projects.outcomes[projectId] || {}

  // Figure out where is that outcome on the canvas:
  // figure out where on the canvas the outcome being edited is
  // located, according to the canvas coordinate system
  // x, y
  const width = state.ui.screensize.width
  const outcomeCoordinate = state.ui.layout[outcomeHeaderHash]

  // Figure out where is that outcome is relation to the window:
  // coordinates translation to css from canvas
  const translate = state.ui.viewport.translate
  const scale = state.ui.viewport.scale
  // position it at the right of the outcome, by moving to the right
  // by the width of a Outcome
  const cssCoordinates = coordsCanvasToPage(
    { x: (outcomeCoordinate.x + outcomeWidth), y: outcomeCoordinate.y },
    translate,
    scale
  )

  return {
    agentAddress: state.agentAddress,
    outcomeHeaderHash,
    outcome: outcomes[outcomeHeaderHash],
    leftConnectionXPosition: cssCoordinates.x,
    topConnectionYPosition: cssCoordinates.y,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    onDeleteClick: async (payload) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const fullyDeletedOutcome = await projectsZomeApi.outcome.deleteOutcomeFully(cellId, payload)
      return dispatch(deleteOutcomeFully(cellIdString, fullyDeletedOutcome))
    },
    updateOutcome: async (entry, headerHash) => {
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
