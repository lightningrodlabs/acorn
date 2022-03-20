import { connect } from 'react-redux'
import {
  createEntryPoint,
  deleteEntryPoint,
} from '../../redux/persistent/projects/entry-points/actions'
import { updateOutcome } from '../../redux/persistent/projects/outcomes/actions'
import { deleteOutcomeMember } from '../../redux/persistent/projects/outcome-members/actions'
import {
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
} from '../../redux/ephemeral/outcome-editing/actions'
import ExpandedViewMode from './ExpandedViewMode.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'

function mapStateToProps(state, ownProps) {
  let outcome,
    creator = null,
    squirrels = [],
    comments = []

  const { projectId } = ownProps
  const outcomes = state.projects.outcomes[projectId] || {}
  const outcomeMembers = state.projects.outcomeMembers[projectId] || {}
  const entryPoints = state.projects.entryPoints[projectId] || {}
  const outcomeComments = state.projects.outcomeComments[projectId] || {}

  if (state.ui.expandedView.outcomeAddress) {
    outcome = outcomes[state.ui.expandedView.outcomeAddress]
    comments = Object.values(outcomeComments).filter(
      (outcomeComment) =>
        outcomeComment.outcome_address === state.ui.expandedView.outcomeAddress
    )
    squirrels = Object.keys(outcomeMembers)
      .map((headerHash) => outcomeMembers[headerHash])
      .filter((outcomeMember) => outcomeMember.outcome_address === outcome.headerHash)
      .map((outcomeMember) => {
        const squirrel = {
          ...state.agents[outcomeMember.agent_address],
          outcomeMemberAddress: outcomeMember.headerHash,
        }
        return squirrel
      })
    Object.keys(state.agents).forEach((value) => {
      if (state.agents[value].address === outcome.user_hash)
        creator = state.agents[value]
    })
  }

  const outcomeAddress = state.ui.expandedView.outcomeAddress
  const entryPoint = Object.values(entryPoints).find(
    (entryPoint) => entryPoint.outcome_address === outcomeAddress
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
      (agentInfo) => agentInfo.outcomeBeingEdited.outcomeAddress === outcomeAddress
    )
    .map((agentInfo) => filterAndAddAgentInfo(agentInfo))
  // this should only ever by a maximum of two peers (one editing title, one editing description)
  return {
    agentAddress: state.agentAddress,
    isEntryPoint,
    entryPointAddress,
    outcomeAddress,
    creator,
    outcome,
    squirrels,
    comments,
    editingPeers,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    createEntryPoint: async (payload) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const entryPoint = await projectsZomeApi.entryPoint.create(
        cellId,
        payload
      )
      return dispatch(createEntryPoint(cellIdString, entryPoint))
    },
    deleteEntryPoint: async (payload) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const entryPointDeleteHash = await projectsZomeApi.entryPoint.delete(
        cellId,
        payload
      )
      // TODO: which header hash should I be passing in to the action?
      return dispatch(deleteEntryPoint(cellIdString, entryPointDeleteHash))
    },
    updateOutcome: async (entry, headerHash) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedOutcome = await projectsZomeApi.outcome.update(cellId, {
        headerHash,
        entry,
      })
      return dispatch(updateOutcome(cellIdString, updatedOutcome))
    },
    deleteOutcomeMember: async (payload) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeMemberDeleteHash = await projectsZomeApi.outcomeMember.delete(
        cellId,
        payload
      )
      return dispatch(deleteOutcomeMember(cellIdString, outcomeMemberDeleteHash))
    },
    startTitleEdit: (outcomeAddress) => {
      return dispatch(startTitleEdit(outcomeAddress))
    },
    endTitleEdit: (outcomeAddress) => {
      return dispatch(endTitleEdit(outcomeAddress))
    },
    startDescriptionEdit: (outcomeAddress) => {
      return dispatch(startDescriptionEdit(outcomeAddress))
    },
    endDescriptionEdit: (outcomeAddress) => {
      return dispatch(endDescriptionEdit(outcomeAddress))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpandedViewMode)
