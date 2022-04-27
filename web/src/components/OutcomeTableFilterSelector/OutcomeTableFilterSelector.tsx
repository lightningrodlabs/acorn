import React, { useState } from 'react'
import {
  ComputedScope,
  ComputedSimpleAchievementStatus,
  Profile,
} from '../../types'
import FilterButton from '../FilterButton/FilterButton'
import FilterDropdown from '../FilterDropdown/FilterDropdown'
import Icon from '../Icon/Icon'
import { OutcomeTableFilter } from '../OutcomeTableRow/filterMatch'
import './OutcomeTableFilterSelector.scss'

export type OutcomeTableFilterSelectorProps = {
  whoAmI: Profile
  onApplyOutcomeTableFilter: (filters: OutcomeTableFilter) => void
  filter: OutcomeTableFilter
  projectMemberProfiles: Profile[]
  tagList: string[]
}

const OutcomeTableFilterSelector: React.FC<OutcomeTableFilterSelectorProps> = ({
  whoAmI,
  onApplyOutcomeTableFilter,
  filter,
  projectMemberProfiles,
  tagList,
}) => {
  const achievementStatusOptions = [
    {
      innerListItem: <>Achieved</>,
      id: ComputedSimpleAchievementStatus.Achieved,
    },
    {
      innerListItem: <>Not Achieved</>,
      id: ComputedSimpleAchievementStatus.NotAchieved,
    },
    {
      innerListItem: <>Partially Achieved</>,
      id: ComputedSimpleAchievementStatus.PartiallyAchieved,
    },
  ]
  const scopeOptions = [
    { innerListItem: <>Small</>, id: ComputedScope.Small },
    { innerListItem: <>Uncertain</>, id: ComputedScope.Uncertain },
    { innerListItem: <>Big</>, id: ComputedScope.Big },
  ]
  const assigneeOptions = projectMemberProfiles.map((profile) =>
    profileOption(profile)
  ) //also include avatar icon
  function profileOption(profile: Profile) {
    return {
      innerListItem: profile.firstName,
      id: profile.agentPubKey,
    }
  }
  const tagOptions = tagList.map((tag) => {
    return { innerListItem: <>{tag}</>, id: tag }
  })
  // [
  //   // get list of tags, maybe using something like useSelector, which performs a computation over the state by checking the tags of outcomes
  // ]
  const [filterText, setOutcomeTableFilterText] = useState('')
  function isOnlyMeAssigned(filter: OutcomeTableFilter, whoAmI: Profile) {
    if ('assignees' in filter) {
      return (
        filter.assignees.length === 1 &&
        filter.assignees[0] === whoAmI.agentPubKey
      )
    } else {
      return false
    }
  }
  return (
    <div className="outcome-table-filter-selector">
      <input
        type="text"
        onChange={(e) => {
          onApplyOutcomeTableFilter({
            keywordOrId: e.target.value.toLowerCase(),
          })
        }}
        placeholder="Search for a outcome"
        autoFocus
      />
      <FilterButton
        size="medium"
        text="Only to me"
        icon={<Icon name="x.svg" />}
        isSelected={isOnlyMeAssigned(filter, whoAmI)}
        onChange={() =>
          isOnlyMeAssigned(filter, whoAmI)
            ? onApplyOutcomeTableFilter({
                ...filter,
                assignees: [],
              })
            : onApplyOutcomeTableFilter({
                ...filter,
                assignees: [whoAmI.agentPubKey],
              })
        }
      />
      <FilterDropdown
        selectedOptions={
          filter.achievementStatus ? filter.achievementStatus : []
        }
        options={achievementStatusOptions}
        text="Achievement Status"
        // TODO
        icon={<Icon name="x.svg" />}
        size="medium"
        onChange={(newSelectionOptions) => {
          onApplyOutcomeTableFilter({
            ...filter,
            achievementStatus: newSelectionOptions,
          })
        }}
      />
      <FilterDropdown
        selectedOptions={filter.scope ? filter.scope : []}
        options={scopeOptions}
        text="scope"
        // TODO
        icon={<Icon name="x.svg" />}
        size="medium"
        onChange={(newSelectionOptions) => {
          onApplyOutcomeTableFilter({
            ...filter,
            scope: newSelectionOptions,
          })
        }}
      />
      <FilterDropdown
        selectedOptions={filter.assignees ? filter.assignees : []}
        options={assigneeOptions}
        text="assignees"
        // TODO
        icon={<Icon name="x.svg" />}
        size="medium"
        onChange={(newSelectionOptions) => {
          onApplyOutcomeTableFilter({
            ...filter,
            assignees: newSelectionOptions,
          })
        }}
      />
      <FilterDropdown
        selectedOptions={filter.tags ? filter.tags : []}
        options={tagOptions}
        text="tags"
        // TODO
        icon={<Icon name="x.svg" />}
        size="medium"
        onChange={(newSelectionOptions) => {
          onApplyOutcomeTableFilter({
            ...filter,
            tags: newSelectionOptions,
          })
        }}
      />
      <div onClick={() => onApplyOutcomeTableFilter({})}>clear selection</div>
      <div>save filter selection</div>
    </div>
  )
}

export default OutcomeTableFilterSelector
