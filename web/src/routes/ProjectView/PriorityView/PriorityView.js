import React from 'react'
import {
  Route,
} from 'react-router-dom'
import { connect } from 'react-redux'

import './PriorityView.css'

import IndentedTreeView from '../../../components/IndentedTreeView/IndentedTreeView'
import goalsAsTrees from '../../../projects/goals/goalsAsTrees'
import PriorityUniversal from './PriorityUniversal/PriorityUniversal'
import PriorityVote from './PriorityVote/PriorityVote'
import { PriorityModeOptions } from '../../../constants'

function PriorityMode({ priorityMode }) {
  switch (priorityMode) {
    case PriorityModeOptions.Universal:
      return <PriorityUniversal />
    case PriorityModeOptions.Vote:
      return <PriorityVote />
    default:
      return null
  }
}
// pull out the `priority_mode` from the {ProjectMeta}
const ConnectedPriorityMode = connect(function (state) {
  const projectId = state.ui.activeProject
  const projectMeta = state.projects.projectMeta[projectId]
  const priorityMode = projectMeta ? projectMeta.priority_mode : null
  return {
    priorityMode,
  }
})(PriorityMode)

function PriorityView({ goalTrees, priorityMode }) {
  return (
    <div className='priority-view-wrapper'>
      <IndentedTreeView goalTrees={goalTrees} />
      <Route
        path='/project/:projectId/priority'
        component={ConnectedPriorityMode}
      />
    </div>
  )
}

function mapDispatchToProps(dispatch) {
  return {}
}
function mapStateToProps(state) {
  const projectId = state.ui.activeProject
  const goalVotes = state.projects.goalVotes[projectId] || {}
  const treeData = {
    agents: state.agents,
    goals: state.projects.goals[projectId] || {},
    edges: state.projects.edges[projectId] || {},
    goalMembers: state.projects.goalMembers[projectId] || {},
    goalVotes: state.projects.goalVotes[projectId] || {},
    goalComments: state.projects.goalComments[projectId] || {}
  }
  const goalTrees = goalsAsTrees(treeData, { withMembers: true })
  return {
    projectId,
    goalTrees,
    goalVotes: Object.values(goalVotes)
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(PriorityView)
