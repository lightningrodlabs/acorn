import React, { useState } from 'react'
import { openExpandedView } from '../../redux/ephemeral/expanded-view/actions'
import { ComputedOutcome, Profile } from '../../types'
import { HeaderHashB64 } from '../../types/shared'
import OutcomeTable from '../OutcomeTable/OutcomeTable'
import OutcomeTableFilterSelector from '../OutcomeTableFilterSelector/OutcomeTableFilterSelector'
import { OutcomeTableFilter } from '../OutcomeTableRow/filterMatch'
import './OutcomeTableWithFilters.scss'

export type OutcomeTableWithFiltersProps = {
  tagList: string[]
  whoAmI: Profile
  projectMemberProfiles: Profile[]
  computedOutcomesAsTree: ComputedOutcome[]
  openExpandedView: (headerHash: HeaderHashB64) => void
}

const OutcomeTableWithFilters: React.FC<OutcomeTableWithFiltersProps> = ({
  whoAmI,
  projectMemberProfiles,
  computedOutcomesAsTree,
  tagList,
  openExpandedView,
}) => {
  const [filter, setOutcomeTableFilter] = useState<OutcomeTableFilter>({
    keywordOrId: '',
  })
  return (
    <div className="outcome-table-with-filters">
      <OutcomeTableFilterSelector
        tagList={tagList}
        whoAmI={whoAmI}
        onApplyOutcomeTableFilter={setOutcomeTableFilter}
        filter={filter}
        projectMemberProfiles={projectMemberProfiles}
      />
      <OutcomeTable
        outcomeTrees={computedOutcomesAsTree}
        filter={filter}
        openExpandedView={openExpandedView}
      />
    </div>
  )
}

export default OutcomeTableWithFilters
