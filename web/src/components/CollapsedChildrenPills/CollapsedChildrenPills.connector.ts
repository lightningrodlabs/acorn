import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import CollapsedChildrenPills from './CollapsedChildrenPills.component'
import { ActionHashB64, CellIdString } from '../../types/shared'
import { expandOutcome } from '../../redux/ephemeral/collapsed-outcomes/actions'

function mapStateToProps(state: RootState) {
  const {
    ui: {
      activeProject,
      layout: { coordinates, dimensions },
      collapsedOutcomes: { collapsedOutcomes },
    },
  } = state
  const projectCollapsedOutcomesData = collapsedOutcomes[activeProject] || {}

  // only keep the list of Outcomes which are actually collapsed
  const projectCollapsedOutcomes = Object.keys(
    projectCollapsedOutcomesData
  ).filter((outcomeActionHash) => {
    return projectCollapsedOutcomesData[outcomeActionHash]
  })

  return {
    activeProject,
    coordinates,
    dimensions,
    projectCollapsedOutcomes,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    expandOutcome: (
      projectCellId: CellIdString,
      outcomeActionHash: ActionHashB64
    ) => {
      return dispatch(expandOutcome(projectCellId, outcomeActionHash))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollapsedChildrenPills)
