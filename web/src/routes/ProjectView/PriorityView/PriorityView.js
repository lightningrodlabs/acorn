import React from 'react'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'

import './PriorityView.scss'

import { updateProjectMeta } from '../../../redux/persistent/projects/project-meta/actions'

import IndentedTreeView from '../../../components/IndentedTreeView/IndentedTreeView'
import goalsAsTrees from '../../../redux/persistent/projects/goals/goalsAsTrees'
import PriorityUniversal from './PriorityUniversal/PriorityUniversal'
import PriorityVote from './PriorityVote/PriorityVote'
import { PriorityModeOptions } from '../../../constants'

function PriorityMode({ projectId, goalTrees, projectMeta, updateProjectMeta }) {
  let main
  switch (projectMeta.priority_mode) {
    case PriorityModeOptions.Universal:
      main = <PriorityUniversal />
      break
    case PriorityModeOptions.Vote:
      main = <PriorityVote />
      break
    default:
      main = null
  }
  const wrappedUpdateProjectMeta = (entry, headerHash) => {
    return updateProjectMeta(entry, headerHash, projectId)
  }
  return (
    <>
      <IndentedTreeView
        goalTrees={goalTrees}
        projectMeta={projectMeta}
        projectId={projectId}
        updateProjectMeta={wrappedUpdateProjectMeta}
      />
      {main}
    </>
  )
}

function mapStateToProps(state) {
  const projectId = state.ui.activeProject
  const projectMeta = state.projects.projectMeta[projectId] || {}
  const treeData = {
    agents: state.agents,
    goals: state.projects.goals[projectId] || {},
    edges: state.projects.edges[projectId] || {},
    goalMembers: state.projects.goalMembers[projectId] || {},
    goalVotes: state.projects.goalVotes[projectId] || {},
    goalComments: state.projects.goalComments[projectId] || {},
  }
  const goalTrees = goalsAsTrees(treeData, { withMembers: true })
  return {
    projectId,
    projectMeta,
    goalTrees,
  }
}
function mapDispatchToProps(dispatch) {
  return {
    updateProjectMeta: (entry, headerHash, cellIdString) => {
      return dispatch(
        updateProjectMeta.create({ cellIdString, payload: { entry, headerHash } })
      )
    },
  }
}
const ConnectedPriorityMode = connect(mapStateToProps, mapDispatchToProps)(PriorityMode)


export default function PriorityView() {
  return (
    <div className="priority-view-wrapper">
      <Route
        path="/project/:projectId/priority"
        component={ConnectedPriorityMode}
      />
    </div>
  )
}
