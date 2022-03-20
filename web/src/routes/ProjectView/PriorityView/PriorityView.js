import React from 'react'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'

import './PriorityView.scss'

import { updateProjectMeta } from '../../../redux/persistent/projects/project-meta/actions'

import IndentedTreeView from '../../../components/IndentedTreeView/IndentedTreeView'
import outcomesAsTrees from '../../../redux/persistent/projects/outcomes/outcomesAsTrees'
import PriorityUniversal from './PriorityUniversal/PriorityUniversal'
import PriorityVote from './PriorityVote/PriorityVote'
import { PriorityModeOptions } from '../../../constants'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'
import { cellIdFromString } from '../../../utils'

function PriorityMode({ projectId, outcomeTrees, projectMeta, updateProjectMeta }) {
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
        outcomeTrees={outcomeTrees}
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
      const projectMeta = projectsZomeApi.projectMeta.update(cellId, { entry, headerHash })
      return dispatch(
        updateProjectMeta(cellIdString, projectMeta)
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
