import React, { useState } from 'react'
import { ComputedOutcome, Profile, Tag } from '../../types'
import { ActionHashB64, AgentPubKeyB64, WithActionHash } from '../../types/shared'
import OutcomeTable from '../OutcomeTable/OutcomeTable'
import OutcomeTableFilterSelector from '../OutcomeTableFilterSelector/OutcomeTableFilterSelector'
import { OutcomeTableFilter } from '../OutcomeTableRow/filterMatch'
import './OutcomeTableWithFilters.scss'

export type OutcomeTableWithFiltersProps = {
  projectTags: WithActionHash<Tag>[]
  whoAmI: Profile
  presentMembers: AgentPubKeyB64[]
  projectMemberProfiles: Profile[]
  computedOutcomesAsTree: ComputedOutcome[]
  openExpandedView: (actionHash: ActionHashB64) => void
  goToOutcome: (actionHash: ActionHashB64) => void
}

const OutcomeTableWithFilters: React.FC<OutcomeTableWithFiltersProps> = ({
  projectTags,
  whoAmI,
  presentMembers,
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
        presentMembers={presentMembers}
        filter={filter}
        openExpandedView={openExpandedView}
        goToOutcome={goToOutcome}
      />
    </div>
  )
}

export default OutcomeTableWithFilters
