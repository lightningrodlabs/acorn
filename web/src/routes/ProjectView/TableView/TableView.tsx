import React, { useContext } from 'react'
import { connect, useSelector } from 'react-redux'
import './TableView.scss'

import { Profile } from '../../../types'
import { RootState } from '../../../redux/reducer'
import ComputedOutcomeContext from '../../../context/ComputedOutcomeContext'
import { openExpandedView } from '../../../redux/ephemeral/expanded-view/actions'
import { HeaderHashB64 } from '../../../types/shared'
import OutcomeTableWithFilters from '../../../components/OutcomeTableWithFilters/OutcomeTableWithFilters'

export type TableViewProps = {
  whoAmI: Profile
  projectMemberProfiles: Profile[]
  openExpandedView: (headerHash: HeaderHashB64) => void
}

const TableView: React.FC<TableViewProps> = ({
  whoAmI,
  projectMemberProfiles,
  openExpandedView,
}) => {
  const { computedOutcomesAsTree } = useContext(ComputedOutcomeContext)
  // const equalityFn = (left: RootState, right: RootState) => {
  // TODO: perform the equality check, to decide whether to recompute
  // return false
  // }
  const outcomeTagList = useSelector(
    (state: RootState) => {
      const projectId = state.ui.activeProject
      const outcomes = state.projects.outcomes[projectId] || {}
      const outcomesArray = Object.values(outcomes)
      // return outcomesArray.filter((tag, pos) => outcomesArray.indexOf(tag) === pos)
      return ['tag', 'sprint', 'v0.0.1']
    } /*, equalityFn */
  )
  
  return (
    <OutcomeTableWithFilters
      tagList={outcomeTagList}
      whoAmI={whoAmI}
      projectMemberProfiles={projectMemberProfiles}
      computedOutcomesAsTree={computedOutcomesAsTree}
      openExpandedView={openExpandedView}
    />
  )
}

function mapStateToProps(state: RootState) {
  const projectId = state.ui.activeProject
  const whoAmIWireElement = state.whoami || {}
  const whoAmI = whoAmIWireElement.entry
  const projectMembers = state.projects.members[projectId] || {}
  const projectMemberProfiles = Object.keys(projectMembers)
    .map((address) => state.agents[address])
    .filter((agent) => agent)
  return {
    whoAmI,
    projectMemberProfiles,
  }
}
function mapDispatchToProps(dispatch) {
  return {
    openExpandedView: (headerHash: HeaderHashB64) =>
      dispatch(openExpandedView(headerHash)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(TableView)
