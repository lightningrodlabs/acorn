import { connect } from 'react-redux'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import { outcomeWidth } from '../../drawing/dimensions'
import { unselectAll } from '../../redux/ephemeral/selection/actions'
import { openOutcomeForm, updateContent } from '../../redux/ephemeral/outcome-form/actions'
import './OutcomeHoverOverlayButtons.scss'
import OutcomeHoverOverlayButtons from './OutcomeHoverOverlayButtons.component'

function mapStateToProps(state) {
  const hoveredAddress = state.ui.hover.hoveredOutcome // null or an address
  const { activeProject } = state.ui
  const outcomes = state.projects.outcomes[activeProject] || {}
  const translate = state.ui.viewport.translate
  const scale = state.ui.viewport.scale

  let outcomeCoordinate,
    outcomeContent,
    cssCoordinates = {}
  if (hoveredAddress) {
    outcomeCoordinate = state.ui.layout[hoveredAddress]
    // Figure out where is that outcome is relation to the window:
    // coordinates translation to css from canvas
    cssCoordinates = coordsCanvasToPage(
      // position it at the right of the outcome, by moving to the right
      // by the width of a Outcome
      { x: outcomeCoordinate.x + outcomeWidth, y: outcomeCoordinate.y + 6 },
      translate,
      scale
    )
    outcomeContent = outcomes[hoveredAddress].content
  }
  return {
    hoveredAddress,
    leftConnectionXPosition: cssCoordinates.x,
    topConnectionYPosition: cssCoordinates.y,
    outcomeCoordinate,
    outcomeContent,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onEditClick: (address, outcomeCoordinate, content) => {
      dispatch(unselectAll())
      dispatch(openOutcomeForm(outcomeCoordinate.x, outcomeCoordinate.y, address))
      dispatch(updateContent(content))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OutcomeHoverOverlayButtons)
