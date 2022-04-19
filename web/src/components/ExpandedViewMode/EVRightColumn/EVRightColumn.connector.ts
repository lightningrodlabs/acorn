import { connect } from 'react-redux'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'
import {
  createEntryPoint,
  deleteEntryPoint,
} from '../../../redux/persistent/projects/entry-points/actions'
import { deleteOutcomeFully } from '../../../redux/persistent/projects/outcomes/actions'
import { RootState } from '../../../redux/reducer'
import { ComputedSimpleAchievementStatus, EntryPoint } from '../../../types'
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
  const outcomeHeaderHash = state.ui.expandedView.outcomeHeaderHash
  const entryPoints = state.projects.entryPoints[projectId] || {}

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
  }
}

function mapDispatchToProps(
  dispatch,
  ownProps: EvRightColumnOwnProps
): EvRightColumnConnectorDispatchProps {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
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
