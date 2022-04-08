import React, { useEffect, useRef } from 'react'
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

function TableView({
  projectId,
  outcomeTrees,
  projectMeta,
  updateProjectmeta,
}) {
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
      const projectMeta = await projectsZomeApi.projectMeta.update(cellId, { entry, headerHash })
      return dispatch(
        updateProjectMeta(cellIdString, projectMeta)
      )
    },
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(TableView)