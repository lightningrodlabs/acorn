import React, { useState } from 'react'
import { ComputedOutcome, Profile, Tag } from '../../types'
import { HeaderHashB64, WithHeaderHash } from '../../types/shared'
import OutcomeTable from '../OutcomeTable/OutcomeTable'
import OutcomeTableFilterSelector from '../OutcomeTableFilterSelector/OutcomeTableFilterSelector'
import { OutcomeTableFilter } from '../OutcomeTableRow/filterMatch'
import './OutcomeTableWithFilters.scss'

export type OutcomeTableWithFiltersProps = {
  projectTags: WithHeaderHash<Tag>[]
  whoAmI: Profile
  projectMemberProfiles: Profile[]
  computedOutcomesAsTree: ComputedOutcome[]
  openExpandedView: (headerHash: HeaderHashB64) => void
  goToOutcome: (headerHash: HeaderHashB64) => void
}

const OutcomeTableWithFilters: React.FC<OutcomeTableWithFiltersProps> = ({
  projectTags,
  whoAmI,
  projectMemberProfiles,
  computedOutcomesAsTree,
  openExpandedView,
  goToOutcome,
}) => {
  const [filter, setOutcomeTableFilter] = useState<OutcomeTableFilter>({})
  return (
    <div className="outcome-table-with-filters">
      <OutcomeTableFilterSelector
        projectTags={projectTags}
        whoAmI={whoAmI}
        onApplyOutcomeTableFilter={setOutcomeTableFilter}
        filter={filter}
        projectMemberProfiles={projectMemberProfiles}
      />
      <OutcomeTable
        projectTags={projectTags}
        outcomeTrees={computedOutcomesAsTree}
        filter={filter}
        openExpandedView={openExpandedView}
        goToOutcome={goToOutcome}
      />
    </div>
  )
}

export default OutcomeTableWithFilters
