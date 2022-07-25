import { connect } from 'react-redux'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'
import {
  createEntryPoint,
  deleteEntryPoint,
} from '../../../redux/persistent/projects/entry-points/actions'
import {
  deleteOutcomeFully,
  updateOutcome,
} from '../../../redux/persistent/projects/outcomes/actions'
import { updateProjectMeta } from '../../../redux/persistent/projects/project-meta/actions'
import { RootState } from '../../../redux/reducer'
import { EntryPoint, Outcome, ProjectMeta } from '../../../types'
import { ActionHashB64 } from '../../../types/shared'
import { cellIdFromString } from '../../../utils'
import EvRightColumn, {
  EvRightColumnConnectorDispatchProps,
  EvRightColumnConnectorStateProps,
  EvRightColumnOwnProps,
} from './EvRightColumn.component'

function mapStateToProps(
  state: RootState,
  ownProps: EvRightColumnOwnProps
): EvRightColumnConnectorStateProps {
  const { projectId } = ownProps

  const activeAgentPubKey = state.agentAddress
  const entryPoints = state.projects.entryPoints[projectId] || {}
  const projectMeta = state.projects.projectMeta[projectId]
  const outcomeActionHash = state.ui.expandedView.outcomeActionHash

  const entryPoint = Object.values(entryPoints).find(
    (entryPoint) => entryPoint.outcomeActionHash === outcomeActionHash
  )
  const isEntryPoint = entryPoint ? true : false
  const entryPointActionHash = entryPoint ? entryPoint.actionHash : null

  return {
    isEntryPoint,
    entryPointActionHash,
    activeAgentPubKey,
    outcomeActionHash,
    projectMeta,
  }
}

function mapDispatchToProps(
  dispatch,
  ownProps: EvRightColumnOwnProps
): EvRightColumnConnectorDispatchProps {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    updateOutcome: async (outcome: Outcome, actionHash: ActionHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedOutcome = await projectsZomeApi.outcome.update(cellId, {
        actionHash,
        entry: outcome,
      })
      return dispatch(updateOutcome(cellIdString, updatedOutcome))
    },
    updateProjectMeta: async (
      projectMeta: ProjectMeta,
      actionHash: ActionHashB64
    ) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedProjectMeta = await projectsZomeApi.projectMeta.update(
        cellId,
        { entry: projectMeta, actionHash }
      )
      return dispatch(updateProjectMeta(cellIdString, updatedProjectMeta))
    },
    createEntryPoint: async (entryPoint: EntryPoint) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const wireRecord = await projectsZomeApi.entryPoint.create(
        cellId,
        entryPoint
      )
      return dispatch(createEntryPoint(cellIdString, wireRecord))
    },
    deleteEntryPoint: async (actionHash: ActionHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      await projectsZomeApi.entryPoint.delete(cellId, actionHash)
      return dispatch(deleteEntryPoint(cellIdString, actionHash))
    },
    onDeleteClick: async (outcomeActionHash: ActionHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const fullyDeletedOutcome = await projectsZomeApi.outcome.deleteOutcomeFully(
        cellId,
        outcomeActionHash
      )
      return dispatch(deleteOutcomeFully(cellIdString, fullyDeletedOutcome))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EvRightColumn)
