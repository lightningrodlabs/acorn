import React, { useState } from 'react'
import {
  ComputedScope,
  ComputedSimpleAchievementStatus,
  Profile,
} from '../../types'
import Avatar from '../Avatar/Avatar'
import FilterButton from '../FilterButton/FilterButton'
import FilterDropdown from '../FilterDropdown/FilterDropdown'
import FilterSearch from '../FilterSearch/FilterSearch'
import Icon from '../Icon/Icon'
import { OutcomeTableFilter } from '../OutcomeTableRow/filterMatch'
import Typography from '../Typography/Typography'
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
    <div className="outcome-table-view-filters-wrapper">
      {/* Filter search for keyword or ID */}
      <div className="table-view-filter-wrapper">
        <FilterSearch
          size={'small'}
          placeholderText="Filter by keyword or ID number"
          filterText={filter.keywordOrId}
          setFilterText={(value) => {
            onApplyOutcomeTableFilter({
              keywordOrId: value.toLowerCase(),
            })
          }}
        />
      </div>
      {/* Only show my cards */}
      <div className="table-view-filter-wrapper">
        <FilterButton
          size="medium"
          text="Only show my cards"
          icon={
            <Avatar
              size="small"
              firstName={whoAmI.firstName}
              lastName={whoAmI.lastName}
              avatarUrl={whoAmI.avatarUrl}
              imported={false}
            />
          }
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
      </div>
      {/* Achievement Status filter */}
      <div className="table-view-filter-wrapper">
        <FilterDropdown
          selectedOptions={
            filter.achievementStatus ? filter.achievementStatus : []
          }
          options={achievementStatusOptions}
          text="Achievement Status"
          icon={<Icon name="circle-dashed.svg" />}
          size="medium"
          onChange={(newSelectionOptions) => {
            onApplyOutcomeTableFilter({
              ...filter,
              achievementStatus: newSelectionOptions,
            })
          }}
        />
      </div>
      {/* Scope filter */}
      <div className="table-view-filter-wrapper">
        <FilterDropdown
          selectedOptions={filter.scope ? filter.scope : []}
          options={scopeOptions}
          text="Scope"
          icon={<Icon name="leaf.svg" />}
          size="medium"
          onChange={(newSelectionOptions) => {
            onApplyOutcomeTableFilter({
              ...filter,
              scope: newSelectionOptions,
            })
          }}
        />
      </div>
      {/* Assignees filter */}
      <div className="table-view-filter-wrapper">
        <FilterDropdown
          selectedOptions={filter.assignees ? filter.assignees : []}
          options={assigneeOptions}
          text="Assignees"
          icon={<Icon name="assignees.svg" />}
          size="medium"
          onChange={(newSelectionOptions) => {
            onApplyOutcomeTableFilter({
              ...filter,
              assignees: newSelectionOptions,
            })
          }}
        />
      </div>
      {/* Tags filter */}
      <div className="table-view-filter-wrapper">
        <FilterDropdown
          selectedOptions={filter.tags ? filter.tags : []}
          options={tagOptions}
          text="Tags"
          icon={<Icon name="tag.svg" />}
          size="medium"
          onChange={(newSelectionOptions) => {
            onApplyOutcomeTableFilter({
              ...filter,
              tags: newSelectionOptions,
            })
          }}
        />
      </div>
      {/* Clear filter selection */}
      <Typography style="body1">
        <div onClick={() => onApplyOutcomeTableFilter({})}>clear selection</div>
      </Typography>

      {/* TODO: add save filter selection function */}
      {/* <div>save filter selection</div> */}
    </div>
  )
}

export default OutcomeTableFilterSelector
