import React from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { connect } from 'react-redux'

// data
import { updateOutcome } from '../../redux/persistent/projects/outcomes/actions'
// ui
import { setActiveEntryPoints } from '../../redux/ephemeral/active-entry-points/actions'
import { setActiveProject } from '../../redux/ephemeral/active-project/actions'
import { closeOutcomeForm } from '../../redux/ephemeral/outcome-form/actions'
import { unselectAll } from '../../redux/ephemeral/selection/actions'
import {
  openExpandedView,
  closeExpandedView,
} from '../../redux/ephemeral/expanded-view/actions'
import {
  animatePanAndZoom,
  resetTranslateAndScale,
} from '../../redux/ephemeral/viewport/actions'
import { ENTRY_POINTS } from '../../searchParams'
import {
  triggerRealtimeInfoSignal,
  sendExitProjectSignal,
} from '../../redux/persistent/projects/realtime-info-signal/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import { RootState } from '../../redux/reducer'
import { CellIdString, ActionHashB64 } from '../../types/shared'
import { Outcome } from '../../types'
import ProjectViewInner, {
  ProjectViewInnerConnectorDispatchProps,
  ProjectViewInnerConnectorStateProps,
  ProjectViewInnerOwnProps,
} from './ProjectView.component'
import { triggerUpdateLayout } from '../../redux/ephemeral/layout/actions'
import constructProjectDataFetchers from '../../api/projectDataFetchers'

function mapStateToProps(
  state: RootState
): ProjectViewInnerConnectorStateProps {
  // could be null
  const expandedViewOutcomeActionHash = state.ui.expandedView.outcomeActionHash
  return {
    expandedViewOutcomeActionHash,
    activeAgentPubKey: state.agentAddress,
  }
}

function mapDispatchToProps(
  dispatch: any,
  ownProps: ProjectViewInnerOwnProps
): ProjectViewInnerConnectorDispatchProps {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  const projectDataFetchers = constructProjectDataFetchers(
    dispatch,
    cellIdString
  )
  return {
    ...projectDataFetchers,
    setActiveProject: (projectId: CellIdString) =>
      dispatch(setActiveProject(projectId)),
    setActiveEntryPoints: (entryPointActionHashes: ActionHashB64[]) =>
      dispatch(setActiveEntryPoints(entryPointActionHashes)),
    triggerUpdateLayout: (instant?: boolean) => {
      return dispatch(triggerUpdateLayout(instant))
    },
    resetProjectView: () => {
      // send this signal so peers know you left project
      dispatch(sendExitProjectSignal(cellIdString))
      dispatch(closeExpandedView())
      dispatch(closeOutcomeForm())
      dispatch(unselectAll())
      dispatch(resetTranslateAndScale())
    },
    openExpandedView: (actionHash: ActionHashB64) =>
      dispatch(openExpandedView(actionHash)),
    closeExpandedView: () => dispatch(closeExpandedView()),
    goInstantlyToOutcome: (outcomeActionHash: ActionHashB64) => {
      const adjustScale = false
      const instant = true
      return dispatch(
        animatePanAndZoom(outcomeActionHash, adjustScale, instant)
      )
    },
    updateOutcome: async (outcome: Outcome, actionHash: ActionHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeWireRecord = await projectsZomeApi.outcome.update(cellId, {
        entry: outcome,
        actionHash,
      })
      return dispatch(updateOutcome(cellIdString, outcomeWireRecord))
    },
    triggerRealtimeInfoSignal: () => dispatch(triggerRealtimeInfoSignal()),
  }
}

const ProjectView = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectViewInner)

function ProjectViewWrapper() {
  const { projectId } = useParams<{ projectId: CellIdString }>()
  const location = useLocation()
  let entryPointActionHashesRaw = new URLSearchParams(location.search).get(
    ENTRY_POINTS
  )
  let entryPointActionHashes = []
  if (entryPointActionHashesRaw) {
    entryPointActionHashes = entryPointActionHashesRaw.split(',')
  }
  return (
    <ProjectView
      projectId={projectId}
      entryPointActionHashes={entryPointActionHashes}
    />
  )
}

export default ProjectViewWrapper
