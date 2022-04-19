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
import { HeaderHashB64 } from '../../../types/shared'
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
  const outcomeHeaderHash = state.ui.expandedView.outcomeHeaderHash

  const entryPoint = Object.values(entryPoints).find(
    (entryPoint) => entryPoint.outcomeHeaderHash === outcomeHeaderHash
  )
  const isEntryPoint = entryPoint ? true : false
  const entryPointHeaderHash = entryPoint ? entryPoint.headerHash : null

  return {
    isEntryPoint,
    entryPointHeaderHash,
    activeAgentPubKey,
    outcomeHeaderHash,
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
    updateOutcome: async (outcome: Outcome, headerHash: HeaderHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedOutcome = await projectsZomeApi.outcome.update(cellId, {
        headerHash,
        entry: outcome,
      })
      return dispatch(updateOutcome(cellIdString, updatedOutcome))
    },
    updateProjectMeta: async (
      projectMeta: ProjectMeta,
      headerHash: HeaderHashB64
    ) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedProjectMeta = await projectsZomeApi.projectMeta.update(
        cellId,
        { entry: projectMeta, headerHash }
      )
      return dispatch(updateProjectMeta(cellIdString, updatedProjectMeta))
    },
    createEntryPoint: async (entryPoint: EntryPoint) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const wireElement = await projectsZomeApi.entryPoint.create(
        cellId,
        entryPoint
      )
      return dispatch(createEntryPoint(cellIdString, wireElement))
    },
    deleteEntryPoint: async (headerHash: HeaderHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      await projectsZomeApi.entryPoint.delete(cellId, headerHash)
      return dispatch(deleteEntryPoint(cellIdString, headerHash))
    },
    onDeleteClick: async (outcomeHeaderHash: HeaderHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const fullyDeletedOutcome = await projectsZomeApi.outcome.deleteOutcomeFully(
        cellId,
        outcomeHeaderHash
      )
      return dispatch(deleteOutcomeFully(cellIdString, fullyDeletedOutcome))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EvRightColumn)
