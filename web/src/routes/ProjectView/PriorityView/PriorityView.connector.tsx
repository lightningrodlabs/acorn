import React from 'react'
import { connect } from 'react-redux'
import ProjectsZomeApi from '../../../api/projectsApi'
import { openExpandedView } from '../../../redux/ephemeral/expanded-view/actions'
import { animatePanAndZoom } from '../../../redux/ephemeral/viewport/actions'
import { updateProjectMeta } from '../../../redux/persistent/projects/project-meta/actions'
import selectProjectMembersPresent from '../../../redux/persistent/projects/realtime-info-signal/select'
import { RootState } from '../../../redux/reducer'
import { cellIdFromString } from '../../../utils'
import PriorityViewInner, {
  PriorityViewDispatchProps,
  PriorityViewOwnProps,
  PriorityViewStateProps,
} from './PriorityView.component'
import useAppWebsocket from '../../../hooks/useAppWebsocket'
import { getAppWs } from '../../../hcWebsockets'

function mapStateToProps(state: RootState): PriorityViewStateProps {
  const projectId = state.ui.activeProject
  const projectMeta = state.projects.projectMeta[projectId]
  const projectTagsObject = state.projects.tags[projectId] || {}
  const presentMembers = projectId
    ? selectProjectMembersPresent(state, projectId)
    : []

  const projectTags = Object.values(projectTagsObject)

  return {
    projectId,
    projectMeta,
    projectTags,
    presentMembers,
  }
}

function mapDispatchToProps(
  dispatch: any,
  ownProps: PriorityViewOwnProps
): PriorityViewDispatchProps {
  const { appWebsocket } = ownProps
  return {
    openExpandedView: (outcomeActionHash) => {
      return dispatch(openExpandedView(outcomeActionHash))
    },
    goToOutcome: (outcomeActionHash) => {
      return dispatch(animatePanAndZoom(outcomeActionHash, true))
    },
    updateProjectMeta: async (projectMeta, actionHash, cellIdString) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const cellId = cellIdFromString(cellIdString)
      const updatedProjectMeta = await projectsZomeApi.projectMeta.update(
        cellId,
        {
          entry: projectMeta,
          actionHash,
        }
      )
      return dispatch(updateProjectMeta(cellIdString, updatedProjectMeta))
    },
  }
}

const PriorityView = connect(
  mapStateToProps,
  mapDispatchToProps
)(PriorityViewInner)

// necessary because this is rendered right inside a route
const PriorityViewWrapper = () => {
  const appWebsocket = useAppWebsocket()
  return <PriorityView appWebsocket={appWebsocket} />
}

export default PriorityViewWrapper
