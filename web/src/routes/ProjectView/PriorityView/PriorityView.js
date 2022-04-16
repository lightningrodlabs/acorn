import React, { useContext } from 'react'
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
import ComputedOutcomeContext from '../../../context/ComputedOutcomeContext'

function PriorityMode({ projectId, projectMeta, updateProjectMeta }) {
  const { computedOutcomes } = useContext(ComputedOutcomeContext)
  let main
  switch (projectMeta.priorityMode) {
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
        outcomeTrees={computedOutcomes}
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
  return {
    projectId,
    projectMeta,
  }
}
function mapDispatchToProps(dispatch) {
  return {
    updateProjectMeta: async (entry, headerHash, cellIdString) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const cellId = cellIdFromString(cellIdString)
      const projectMeta = await projectsZomeApi.projectMeta.update(cellId, { entry, headerHash })
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
