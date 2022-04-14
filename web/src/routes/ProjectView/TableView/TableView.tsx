import React, { useEffect, useRef, useState } from 'react'
import { connect, useStore } from 'react-redux'
import setupEventListeners from '../../../event-listeners'
import { setScreenDimensions } from '../../../redux/ephemeral/screensize/actions'
import { openExpandedView } from '../../../redux/ephemeral/expanded-view/actions'
import { updateProjectMeta } from '../../../redux/persistent/projects/project-meta/actions'
import outcomesAsTrees from '../../../redux/persistent/projects/outcomes/outcomesAsTrees'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'
import { cellIdFromString } from '../../../utils'
import IndentedTreeView from '../../../components/IndentedTreeView/IndentedTreeView'
import './TableView.scss'
import { ComputedScope, ComputedSimpleAchievementStatus } from '../../../types'
import { AgentPubKeyB64 } from '../../../types/shared'

type Filter = {
	keywordOrId?: string,
	achievementStatus?: ComputedSimpleAchievementStatus[],
	scope?: ComputedScope[],
	assignees?: AgentPubKeyB64[],
	tags?: string[]
}

function OutcomeTable({
  projectId,
  outcomeTrees,
  projectMeta,
  updateProjectmeta,
  filter,
}) {
  // const [filter, setFilter] = useState<Filter>({
  //   keywordOrId: 'n'
  // })
  // const filter = null
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
function filterMatch(outcome, filter) {
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

function OutcomeTableRow({
  projectId,
  outcome,
  projectMeta,
  updateProjectmeta,
  filter,
  parentExpanded,
  indentationLevel,
}) {
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

function FilterSelector({

}) {
  return (
    <div className="filter-selector-panel">
      
    </div>
  )
}
function TableView({
  projectId,
  outcomeTrees,
  projectMeta,
  updateProjectmeta,
}) {
  const wrappedUpdateProjectMeta = (entry, headerHash) => {
    return updateProjectMeta(entry, headerHash, projectId)
  }
  console.log('outcome tree:', outcomeTrees)
  const [filter, setFilter] = useState<Filter>({
    keywordOrId: 'n'
  })
  return (
    <div className="table-view-wrapper">
      <FilterSelector
        onApplyFilter={() => setFilter(event.filter)}
      />
      <OutcomeTable
        outcomeTrees={outcomeTrees}
        projectMeta={projectMeta}
        projectId={projectId}
        updateProjectMeta={wrappedUpdateProjectMeta}
        filter={filter}
      />
    </div>
  )
}

function mapStateToProps(state) {
  const projectId = state.ui.activeProject
  const projectMeta = state.projects.projectMeta[projectId] || {}
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
