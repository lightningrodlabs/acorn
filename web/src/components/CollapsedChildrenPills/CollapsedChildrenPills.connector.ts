import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import CollapsedChildrenPills from './CollapsedChildrenPills.component'
import { ActionHashB64, CellIdString } from '../../types/shared'
import { expandOutcome } from '../../redux/ephemeral/collapsed-outcomes/actions'

function mapStateToProps(state: RootState) {
  const {
    ui: {
      activeProject,
      viewport: { translate, scale },
      layout: coordinates,
      collapsedOutcomes: { collapsedOutcomes },
    },
  } = state
  const projectTags = Object.values(state.projects.tags[activeProject] || {})
  const projectCollapsedOutcomesData = collapsedOutcomes[activeProject] || {}

  // only keep the list of Outcomes which are actually collapsed
  const projectCollapsedOutcomes = Object.keys(
    projectCollapsedOutcomesData
  ).filter((outcomeActionHash) => {
    return projectCollapsedOutcomesData[outcomeActionHash]
  })

  return {
    activeProject,
    translate,
    projectTags,
    zoomLevel: scale,
    coordinates,
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
