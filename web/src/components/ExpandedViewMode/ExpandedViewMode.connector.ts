import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import {
  createEntryPoint,
  deleteEntryPoint,
} from '../../redux/persistent/projects/entry-points/actions'
import { deleteOutcomeFully, updateOutcome } from '../../redux/persistent/projects/outcomes/actions'
import { deleteOutcomeMember } from '../../redux/persistent/projects/outcome-members/actions'
import {
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
} from '../../redux/ephemeral/outcome-editing/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import ExpandedViewMode from './ExpandedViewMode.component'
import { HeaderHashB64 } from '../../types/shared'
import { EntryPoint, Outcome } from '../../types'

function mapStateToProps(state: RootState, ownProps) {
  let assignees = [],
    comments = []

  const { projectId } = ownProps
  const outcomeMembers = state.projects.outcomeMembers[projectId] || {}
  const entryPoints = state.projects.entryPoints[projectId] || {}
  const outcomeComments = state.projects.outcomeComments[projectId] || {}
  
  const outcomeHeaderHash = state.ui.expandedView.outcomeHeaderHash

  if (outcomeHeaderHash) {
    comments = Object.values(outcomeComments).filter(
      (outcomeComment) =>
        outcomeComment.outcomeHeaderHash === state.ui.expandedView.outcomeHeaderHash
    )
    assignees = Object.keys(outcomeMembers)
      .map((headerHash) => outcomeMembers[headerHash])
      .filter((outcomeMember) => outcomeMember.outcomeHeaderHash === outcomeHeaderHash)
      .map((outcomeMember) => {
        const assignee = {
          ...state.agents[outcomeMember.memberAgentPubKey],
          outcomeMemberAddress: outcomeMember.headerHash,
        }
        return assignee
      })
  }

  const entryPoint = Object.values(entryPoints).find(
    (entryPoint) => entryPoint.outcomeHeaderHash === outcomeHeaderHash
  )
  const isEntryPoint = entryPoint ? true : false
  const entryPointAddress = entryPoint ? entryPoint.headerHash : null

  function filterAndAddAgentInfo(agentInfo) {
    delete agentInfo.projectId
    delete agentInfo.outcomeExpandedView
    agentInfo.profileInfo = state.agents[agentInfo.agentPubKey]
    return agentInfo
  }
  const editingPeers = Object.values(state.ui.realtimeInfo)
    .filter((agentInfo) => agentInfo.outcomeBeingEdited)
    .filter(
      (agentInfo) => agentInfo.outcomeBeingEdited.outcomeHeaderHash === outcomeHeaderHash
    )
    .map((agentInfo) => filterAndAddAgentInfo(agentInfo))
  // this should only ever by a maximum of two peers (one editing title, one editing description)
  return {
    agentAddress: state.agentAddress,
    isEntryPoint,
    entryPointAddress,
    outcomeHeaderHash,
    profiles: state.agents,
    assignees,
    comments,
    editingPeers,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
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
      await projectsZomeApi.entryPoint.delete(
        cellId,
        headerHash
      )
      return dispatch(deleteEntryPoint(cellIdString, headerHash))
    },
    updateOutcome: async (outcome: Outcome, headerHash: HeaderHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedOutcome = await projectsZomeApi.outcome.update(cellId, {
        headerHash,
        entry: outcome,
      })
      return dispatch(updateOutcome(cellIdString, updatedOutcome))
    },
    deleteOutcomeMember: async (headerHash: HeaderHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      await projectsZomeApi.outcomeMember.delete(
        cellId,
        headerHash
      )
      return dispatch(deleteOutcomeMember(cellIdString, headerHash))
    },
    startTitleEdit: (outcomeHeaderHash) => {
      return dispatch(startTitleEdit(outcomeHeaderHash))
    },
    endTitleEdit: (outcomeHeaderHash) => {
      return dispatch(endTitleEdit(outcomeHeaderHash))
    },
    startDescriptionEdit: (outcomeHeaderHash) => {
      return dispatch(startDescriptionEdit(outcomeHeaderHash))
    },
    endDescriptionEdit: (outcomeHeaderHash) => {
      return dispatch(endDescriptionEdit(outcomeHeaderHash))
    },
    onDeleteClick: async (outcomeHeaderHash) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const fullyDeletedOutcome = await projectsZomeApi.outcome.deleteOutcomeFully(cellId, outcomeHeaderHash)
      return dispatch(deleteOutcomeFully(cellIdString, fullyDeletedOutcome))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpandedViewMode)
