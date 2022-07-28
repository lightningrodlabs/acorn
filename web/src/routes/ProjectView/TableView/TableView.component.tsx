import React, { useContext } from 'react'
import './TableView.scss'

import { Profile } from '../../../types'
import ComputedOutcomeContext from '../../../context/ComputedOutcomeContext'
import { Tag } from '../../../types'
import { ActionHashB64, AgentPubKeyB64, WithActionHash } from '../../../types/shared'
import OutcomeTableWithFilters from '../../../components/OutcomeTableWithFilters/OutcomeTableWithFilters'

export type TableViewConnectorStateProps = {
  whoAmI: Profile
  presentMembers: AgentPubKeyB64[]
  projectMemberProfiles: Profile[]
  projectTags: WithActionHash<Tag>[]
}

export type TableViewConnectorDispatchProps = {
  openExpandedView: (actionHash: ActionHashB64) => void
  goToOutcome: (actionHash: ActionHashB64) => void
}

export type TableViewProps = TableViewConnectorStateProps &
  TableViewConnectorDispatchProps

const TableView: React.FC<TableViewProps> = ({
  whoAmI,
  presentMembers,
  projectMemberProfiles,
  projectTags,
  openExpandedView,
  goToOutcome,
}) => {
  const { computedOutcomesAsTree } = useContext(ComputedOutcomeContext)

  return (
    <div className="table-view">
      <OutcomeTableWithFilters
        projectTags={projectTags}
        whoAmI={whoAmI}
        presentMembers={presentMembers}
        projectMemberProfiles={projectMemberProfiles}
        computedOutcomesAsTree={computedOutcomesAsTree}
        openExpandedView={openExpandedView}
        goToOutcome={goToOutcome}
      />
    </div>
  )
}

export default TableView
