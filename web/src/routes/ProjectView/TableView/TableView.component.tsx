import React, { useContext } from 'react'
import './TableView.scss'

import { Profile } from '../../../types'
import ComputedOutcomeContext from '../../../context/ComputedOutcomeContext'
import { Tag } from '../../../types'
import { HeaderHashB64, WithHeaderHash } from '../../../types/shared'
import OutcomeTableWithFilters from '../../../components/OutcomeTableWithFilters/OutcomeTableWithFilters'

export type TableViewConnectorStateProps = {
  whoAmI: Profile
  projectMemberProfiles: Profile[]
  projectTags: WithHeaderHash<Tag>[]
}

export type TableViewConnectorDispatchProps = {
  openExpandedView: (headerHash: HeaderHashB64) => void
}

export type TableViewProps = TableViewConnectorStateProps &
  TableViewConnectorDispatchProps

const TableView: React.FC<TableViewProps> = ({
  whoAmI,
  projectMemberProfiles,
  projectTags,
  openExpandedView,
}) => {
  const { computedOutcomesAsTree } = useContext(ComputedOutcomeContext)

  return (
    <div className="table-view">
      <OutcomeTableWithFilters
        projectTags={projectTags}
        whoAmI={whoAmI}
        projectMemberProfiles={projectMemberProfiles}
        computedOutcomesAsTree={computedOutcomesAsTree}
        openExpandedView={openExpandedView}
      />
    </div>
  )
}

export default TableView
