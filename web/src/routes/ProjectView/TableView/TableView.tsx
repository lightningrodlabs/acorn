import React, { useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { updateProjectMeta } from '../../../redux/persistent/projects/project-meta/actions'
import outcomesAsTrees from '../../../redux/persistent/projects/outcomes/outcomesAsTrees'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'
import { cellIdFromString } from '../../../utils'
import './TableView.scss'
import { ComputedOutcome, ComputedScope, ComputedSimpleAchievementStatus, Member, Profile, ProjectMeta } from '../../../types'
import { AgentPubKeyB64 } from '../../../types/shared'
import FilterDropdown from '../../../components/FilterDropdown/FilterDropdown'
import FilterButton from '../../../components/FilterButton/FilterButton'
import Icon from '../../../components/Icon/Icon'
import { RootState } from '../../../redux/reducer'
import { CellId } from '@holochain/client'

type Filter = {
	keywordOrId?: string,
	achievementStatus?: ComputedSimpleAchievementStatus[],
	scope?: ComputedScope[],
	assignees?: AgentPubKeyB64[],
	tags?: string[]
}

export type OutcomeTableProps = {
  outcomeTrees: any,
  filter: Filter
}

const OutcomeTable: React.FC<OutcomeTableProps> = ({
  outcomeTrees,
  filter,
}) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID#</th>
          <th>Outcome Statement</th>
          <th>Assignees</th>
          <th>Tags</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {outcomeTrees.map((outcome) => (
          <OutcomeTableRow
            outcome={outcome}
            filter={filter}
            parentExpanded={true}
            indentationLevel={0}
          />
        ))}
      </tbody>
    </table>
  )
}

// would it make more sense for these helper function to be in a different file?
function filterMatch(outcome: ComputedOutcome, filter: Filter) {
  let keywordOrIdMatch = true
  let achievementStatusMatch = true
  let scopeMatch = true
  let assigneesMatch = true
  let tagsMatch = true

  if ('keywordOrId' in filter) {
    keywordOrIdMatch =
      !filter.keywordOrId.length ||
      (outcome.content &&
        outcome.content
          .toLowerCase()
          .includes(filter.keywordOrId.toLowerCase()))
  }

  if ('achievementStatus' in filter) {
    achievementStatusMatch = false
    // TODO: get actual ComputedSimpleAchievementStatus for the Outcome
    const outcomeSimpleAchievementStatus = ComputedSimpleAchievementStatus.Achieved
    
    for (const status of filter.achievementStatus) {
      if (outcomeSimpleAchievementStatus === status) {
        achievementStatusMatch = true
        break
      }
    }
  }

  if ('scope' in filter) {
    scopeMatch = false
    // TODO: get actual ComputedScope instead of hardcoding here
    const outcomeComputedScope = ComputedScope.Big
    for (const scope of filter.scope) {
      if (scope === outcomeComputedScope) {
        scopeMatch = true
        break
      }
    }
  }

  if ('assignees' in filter) {
    assigneesMatch = false
    for (const assignee of filter.assignees) {
       if (outcome.members.includes(assignee)) {
         assigneesMatch = true // assuming assignee filter selection is an OR rather than AND
         break
       }
    }
  }

  if ('tags' in filter) {
    tagsMatch = false
    for (const tag of filter.tags) {
       if (outcome.tags.includes(tag)) {
         tagsMatch = true 
         break
       }
    }
  }
  return (
    keywordOrIdMatch &&
    achievementStatusMatch &&
    scopeMatch &&
    assigneesMatch &&
    tagsMatch
  )
}

export type OutcomeTableRowProps = {
  outcome: any, //define this type
  filter: Filter,
  parentExpanded: boolean,
  indentationLevel: number
}

const OutcomeTableRow: React.FC<OutcomeTableRowProps> = ({
  outcome,
  filter,
  parentExpanded,
  indentationLevel,
}) => {
  let match = false
  let [expanded, setExpanded] = useState(true) //for now assume everything is expanded by default, will need to look into how to expand collapse all in one action
  if (filter) {
    match = filterMatch(outcome, filter)
  }
  return (
    <>
      {parentExpanded && (match || !filter) && (
        <tr>
          <td>{'123456'}</td>
          <td>
            {'-'.repeat(indentationLevel)}
            {outcome.children.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setExpanded(!expanded)
                }}
              >
                {expanded ? 'v' : '>'}
              </button>
            )}
            {outcome.content}
          </td>
          <td>{outcome.members}</td>
          <td>{outcome.tags}</td>
          <td>{outcome.timeFrame}</td>
        </tr>
      )}
      {outcome.children.length > 0 &&
        outcome.children.map((outcomeChild) => (
          <OutcomeTableRow
            outcome={outcomeChild}
            filter={filter}
            parentExpanded={expanded && parentExpanded}
            indentationLevel={indentationLevel + 1}
          />
        ))}
    </>
  )
}

/*
  FilterSelector
*/

export type FilterSelectorProps = {
  onApplyFilter: (filters: Filter) => void
  filter: Filter
  projectMemberProfiles: Profile[]
}

const FilterSelector: React.FC<FilterSelectorProps> = ({
  onApplyFilter,
  filter,
  projectMemberProfiles,
}) =>  {

  // const equalityFn = (left: RootState, right: RootState) => {
    // TODO: perform the equality check, to decide whether to recompute
    // return false
  // }
  const outcomeTagList = useSelector((state: RootState) => {
    const projectId = state.ui.activeProject
    const outcomes = state.projects.outcomes[projectId] || {}
    const outcomesArray = Object.values(outcomes)
    // return outcomesArray.filter((tag, pos) => outcomesArray.indexOf(tag) === pos)
    return ['tag', 'sprint', 'v0.0.1']
  }/*, equalityFn */)


  const achievementStatusOptions = [
    { innerListItem: <>Achieved</>, id: ComputedSimpleAchievementStatus.Achieved},
    { innerListItem: <>Not Achieved</>, id: ComputedSimpleAchievementStatus.NotAchieved},
    { innerListItem: <>Partially Achieved</>, id: ComputedSimpleAchievementStatus.PartiallyAchieved}
  ]
  const scopeOptions = [
    { innerListItem: <>Small</>, id: ComputedScope.Small},
    { innerListItem: <>Uncertain</>, id: ComputedScope.Uncertain},
    { innerListItem: <>Big</>, id: ComputedScope.Big}
  ]
  const assigneeOptions = projectMemberProfiles.map((profile) => profileOption(profile)) //also include avatar icon
  function profileOption(profile: Profile) {
    return {
      innerListItem: profile.firstName,
      id: profile.agentPubKey
    }
  }
  const tagOptions = outcomeTagList.map((tag) => {
    return { innerListItem: <>{tag}</>, id: tag}
  })
  // [
  //   // get list of tags, maybe using something like useSelector, which performs a computation over the state by checking the tags of outcomes
  // ]
  const [filterText, setFilterText] = useState('')
  return (
    <div className="filter-selector-panel">
      <input
        type="text"
        onChange={(e) => {
          onApplyFilter({keywordOrId: e.target.value.toLowerCase()})
        }}
        placeholder="Search for a outcome"
        autoFocus
      />
      <FilterButton size='medium' text='Only to me' icon={<Icon name='x.svg' />} isSelected={true} onChange={() => {}} />
      <FilterDropdown 
        selectedOptions={filter.achievementStatus ? filter.achievementStatus : []}
        options={achievementStatusOptions}
        text='Achievement Status'
        // TODO
        icon={<Icon name='x.svg' />}
        size='medium'
        onChange={(newSelectionOptions) => {
          onApplyFilter({
            ...filter,
            achievementStatus: newSelectionOptions
          })
        }}
      />
      <FilterDropdown 
        selectedOptions={filter.scope ? filter.scope : []}
        options={scopeOptions}
        text='scope'
        // TODO
        icon={<Icon name='x.svg' />}
        size='medium'
        onChange={(newSelectionOptions) => {
          onApplyFilter({
            ...filter,
            scope: newSelectionOptions
          })
        }}
      />
      <FilterDropdown 
        selectedOptions={filter.assignees ? filter.assignees : []}
        options={assigneeOptions}
        text='assignees'
        // TODO
        icon={<Icon name='x.svg' />}
        size='medium'
        onChange={(newSelectionOptions) => {
          onApplyFilter({
            ...filter,
            assignees: newSelectionOptions
          })
        }}
      />
      <FilterDropdown 
        selectedOptions={filter.tags ? filter.tags : []}
        options={tagOptions}
        text='tags'
        // TODO
        icon={<Icon name='x.svg' />}
        size='medium'
        onChange={(newSelectionOptions) => {
          onApplyFilter({
            ...filter,
            tags: newSelectionOptions
          })
        }}
      />
      <div onClick={() => onApplyFilter({})}>clear selection</div>
      <div>save filter selection</div>
    </div>
  )
}

export type TableViewProps = {
  projectId: CellId,
  outcomeTrees: any,
  projectMeta: ProjectMeta,
  projectMemberProfiles: Profile[],
  updateProjectMeta,
}

const TableView: React.FC<TableViewProps> = ({
  outcomeTrees,
  projectMemberProfiles,
}) => {
  console.log('outcome tree:', outcomeTrees)
  const [filter, setFilter] = useState<Filter>({
    keywordOrId: 'n'
  })
  return (
    <div className="table-view-wrapper">
      <FilterSelector
        onApplyFilter={setFilter}
        filter={filter}
        projectMemberProfiles={projectMemberProfiles}
      />
      <OutcomeTable
        outcomeTrees={outcomeTrees}
        filter={filter}
      />
    </div>
  )
}

function mapStateToProps(state: RootState) {
  const projectId = state.ui.activeProject
  const projectMeta = state.projects.projectMeta[projectId] || {}
  const projectMembers = state.projects.members[projectId] || {}
  const projectMemberProfiles = Object.keys(projectMembers)
    .map((address) => state.agents[address])
    .filter((agent) => agent)
  const treeData = {
    agents: state.agents,
    outcomes: state.projects.outcomes[projectId] || {},
    connections: state.projects.connections[projectId] || {},
    outcomeMembers: state.projects.outcomeMembers[projectId] || {},
    outcomeVotes: state.projects.outcomeVotes[projectId] || {},
    outcomeComments: state.projects.outcomeComments[projectId] || {},
  }
  const outcomeTrees = outcomesAsTrees(treeData, { withMembers: true })
  return {
    projectId,
    projectMeta,
    outcomeTrees,
    projectMemberProfiles
  }
}
function mapDispatchToProps(dispatch) {
  return {
    updateProjectMeta: async (entry, headerHash, cellIdString) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const cellId = cellIdFromString(cellIdString)
      const projectMeta = await projectsZomeApi.projectMeta.update(cellId, {
        entry,
        headerHash,
      })
      return dispatch(updateProjectMeta(cellIdString, projectMeta))
    },
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(TableView)
