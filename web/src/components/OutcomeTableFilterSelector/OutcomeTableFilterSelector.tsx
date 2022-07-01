import React from 'react'
import {
  ComputedScope,
  ComputedSimpleAchievementStatus,
  Profile,
  Tag as TagType,
} from '../../types'
import { WithHeaderHash } from '../../types/shared'
import Avatar from '../Avatar/Avatar'
import FilterButton from '../FilterButton/FilterButton'
import FilterDropdown from '../FilterDropdown/FilterDropdown'
import FilterSearch from '../FilterSearch/FilterSearch'
import Icon from '../Icon/Icon'
import { OutcomeTableFilter } from '../OutcomeTableRow/filterMatch'
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator'
import Tag from '../Tag/Tag'
import Typography from '../Typography/Typography'
import './OutcomeTableFilterSelector.scss'

export type OutcomeTableFilterSelectorProps = {
  whoAmI: Profile
  onApplyOutcomeTableFilter: (filters: OutcomeTableFilter) => void
  filter: OutcomeTableFilter
  projectMemberProfiles: Profile[]
  projectTags: WithHeaderHash<TagType>[]
}

const OutcomeTableFilterSelector: React.FC<OutcomeTableFilterSelectorProps> = ({
  whoAmI,
  onApplyOutcomeTableFilter,
  filter,
  projectMemberProfiles,
  projectTags,
}) => {
  const whoAmIFirstName = whoAmI ? whoAmI.firstName : 'J'
  const whoAmILastName = whoAmI ? whoAmI.lastName : 'J'
  const whoAmIAvatarUrl = whoAmI ? whoAmI.avatarUrl : ''
  const activeAgentPubKey = whoAmI ? whoAmI.agentPubKey : ''

  const achievementStatusOptions = [
    {
      innerListItem: (
        <>
          <ProgressIndicator progress={100} /> Achieved
        </>
      ),
      id: ComputedSimpleAchievementStatus.Achieved,
    },
    {
      innerListItem: (
        <>
          <ProgressIndicator progress={0} />
          Not Achieved
        </>
      ),
      id: ComputedSimpleAchievementStatus.NotAchieved,
    },
    {
      innerListItem: (
        <>
          <ProgressIndicator progress={33} />
          Partially Achieved
        </>
      ),
      id: ComputedSimpleAchievementStatus.PartiallyAchieved,
    },
  ]
  const scopeOptions = [
    { innerListItem: <>Small</>, id: ComputedScope.Small },
    { innerListItem: <>Uncertain</>, id: ComputedScope.Uncertain },
    { innerListItem: <>Other</>, id: ComputedScope.Big },
  ]
  const assigneeOptions = projectMemberProfiles.map((profile) =>
    profileOption(profile)
  )
  function profileOption(profile: Profile) {
    return {
      innerListItem: (
        <div className="filter-menu-assingees-list-item">
          <div className="filter-menu-assingees-list-item-avatar">
            <Avatar
              size="small"
              firstName={profile.firstName}
              lastName={profile.lastName}
              avatarUrl={profile.avatarUrl}
              withWhiteBorder
            />
          </div>
          <div className="filter-menu-assingees-list-item-name">
            {profile.firstName}
            {'  '}
            {profile.lastName}
          </div>
        </div>
      ),
      id: profile.agentPubKey,
    }
  }
  const tagOptions = projectTags.map((tag) => {
    return {
      innerListItem: (
        <Tag text={tag.text} backgroundColor={tag.backgroundColor} />
      ),
      id: tag.headerHash,
    }
  })
  function isOnlyMeAssigned(filter: OutcomeTableFilter) {
    if ('assignees' in filter) {
      return (
        filter.assignees.length === 1 &&
        filter.assignees[0] === activeAgentPubKey
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
            let newFilter = {
              ...filter,
            }
            if (value.length === 0) {
              delete newFilter.keywordOrId
            } else {
              newFilter.keywordOrId = value.toLowerCase()
            }
            onApplyOutcomeTableFilter(newFilter)
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
              firstName={whoAmIFirstName}
              lastName={whoAmILastName}
              avatarUrl={whoAmIAvatarUrl}
              imported={false}
            />
          }
          isSelected={isOnlyMeAssigned(filter)}
          onChange={() => {
            let newFilter = {
              ...filter,
            }
            if (isOnlyMeAssigned(filter)) {
              delete newFilter.assignees
            } else {
              newFilter.assignees = [activeAgentPubKey]
            }
            onApplyOutcomeTableFilter(newFilter)
          }}
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
          // @ts-ignore
          icon={<Icon name="circle-dashed.svg" />}
          size="medium"
          onChange={(newSelectionOptions) => {
            let newFilter = {
              ...filter,
            }
            if (newSelectionOptions.length > 0) {
              newFilter.achievementStatus = newSelectionOptions
            } else {
              delete newFilter.achievementStatus
            }
            onApplyOutcomeTableFilter(newFilter)
          }}
        />
      </div>
      {/* Scope filter */}
      <div className="table-view-filter-wrapper scope">
        <FilterDropdown
          selectedOptions={filter.scope ? filter.scope : []}
          options={scopeOptions}
          text="Scope"
          // @ts-ignore
          icon={<Icon name="leaf.svg" />}
          size="medium"
          onChange={(newSelectionOptions) => {
            let newFilter = {
              ...filter,
            }
            if (newSelectionOptions.length > 0) {
              newFilter.scope = newSelectionOptions
            } else {
              delete newFilter.scope
            }
            onApplyOutcomeTableFilter(newFilter)
          }}
        />
      </div>
      {/* Assignees filter */}
      <div className="table-view-filter-wrapper assignees">
        <FilterDropdown
          selectedOptions={filter.assignees ? filter.assignees : []}
          options={assigneeOptions}
          text="Assignees"
          // @ts-ignore
          icon={<Icon name="assignees.svg" />}
          size="medium"
          onChange={(newSelectionOptions) => {
            let newFilter = {
              ...filter,
            }
            if (newSelectionOptions.length > 0) {
              newFilter.assignees = newSelectionOptions
            } else {
              delete newFilter.assignees
            }
            onApplyOutcomeTableFilter(newFilter)
          }}
        />
      </div>
      {/* Tags filter */}
      <div className="table-view-filter-wrapper tags">
        <FilterDropdown
          selectedOptions={filter.tags ? filter.tags : []}
          options={tagOptions}
          text="Tags"
          // @ts-ignore
          icon={<Icon name="tag.svg" />}
          size="medium"
          onChange={(newSelectionOptions) => {
            let newFilter = {
              ...filter,
            }
            if (newSelectionOptions.length > 0) {
              newFilter.tags = newSelectionOptions
            } else {
              delete newFilter.tags
            }
            onApplyOutcomeTableFilter(newFilter)
          }}
        />
      </div>
      {/* Clear filter selection */}

      {
        (filter.keywordOrId ||
          filter.achievementStatus ||
          filter.assignees ||
          filter.scope ||
          filter.tags) && (
          // Clear filter selection button
          <div className="table-view-filter-wrapper-clear">
            <Typography style="caption4">
              <div onClick={() => onApplyOutcomeTableFilter({})}>
                Clear selection
              </div>
            </Typography>
          </div>
        )

        /* TODO: add save filter selection function */
        /* <div>save filter selection</div> */
      }
    </div>
  )
}

export default OutcomeTableFilterSelector
