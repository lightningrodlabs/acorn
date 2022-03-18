import { connect } from 'react-redux'
import {
  createEntryPoint,
  archiveEntryPoint,
  deleteEntryPoint,
} from '../../redux/persistent/projects/entry-points/actions'
import { updateGoal } from '../../redux/persistent/projects/goals/actions'
import { archiveGoalMember } from '../../redux/persistent/projects/goal-members/actions'
import {
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
} from '../../redux/ephemeral/goal-editing/actions'
import ExpandedViewMode from './ExpandedViewMode.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'

function mapStateToProps(state, ownProps) {
  let goal,
    creator = null,
    squirrels = [],
    comments = []

  const { projectId } = ownProps
  const goals = state.projects.goals[projectId] || {}
  const goalMembers = state.projects.goalMembers[projectId] || {}
  const entryPoints = state.projects.entryPoints[projectId] || {}
  const goalComments = state.projects.goalComments[projectId] || {}

  if (state.ui.expandedView.goalAddress) {
    goal = goals[state.ui.expandedView.goalAddress]
    comments = Object.values(goalComments).filter(
      (goalComment) =>
        goalComment.goal_address === state.ui.expandedView.goalAddress
    )
    squirrels = Object.keys(goalMembers)
      .map((headerHash) => goalMembers[headerHash])
      .filter((goalMember) => goalMember.goal_address === goal.headerHash)
      .map((goalMember) => {
        const squirrel = {
          ...state.agents[goalMember.agent_address],
          goalMemberAddress: goalMember.headerHash,
        }
        return squirrel
      })
    Object.keys(state.agents).forEach((value) => {
      if (state.agents[value].address === goal.user_hash)
        creator = state.agents[value]
    })
  }

  const goalAddress = state.ui.expandedView.goalAddress
  const entryPoint = Object.values(entryPoints).find(
    (entryPoint) => entryPoint.goal_address === goalAddress
  )
  const isEntryPoint = entryPoint ? true : false
  const entryPointAddress = entryPoint ? entryPoint.headerHash : null

  function filterAndAddAgentInfo(agentInfo) {
    delete agentInfo.projectId
    delete agentInfo.goalExpandedView
    agentInfo.profileInfo = state.agents[agentInfo.agentPubKey]
    return agentInfo
  }
  const editingPeers = Object.values(state.ui.realtimeInfo)
    .filter((agentInfo) => agentInfo.goalBeingEdited)
    .filter(
      (agentInfo) => agentInfo.goalBeingEdited.goalAddress === goalAddress
    )
    .map((agentInfo) => filterAndAddAgentInfo(agentInfo))
  // this should only ever by a maximum of two peers (one editing title, one editing description)
  return {
    agentAddress: state.agentAddress,
    isEntryPoint,
    entryPointAddress,
    goalAddress,
    creator,
    goal,
    squirrels,
    comments,
    editingPeers,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
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
    archiveEntryPoint: async (payload) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const entryPointDeleteHash = await projectsZomeApi.entryPoint.delete(
        cellId,
        payload
      )
      // which header hash should I be passing in to the action?
      return dispatch(deleteEntryPoint(cellIdString, entryPointDeleteHash))
    },
    updateGoal: async (entry, headerHash) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedOutcome = await projectsZomeApi.outcome.update(cellId, {
        headerHash,
        entry,
      })
      return dispatch(updateGoal(cellIdString, updatedOutcome))
    },
    archiveGoalMember: async (payload) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeMemberDeleteHash = await projectsZomeApi.outcomeMember.delete(
        cellId,
        payload
      )
      return dispatch(archiveGoalMember(cellIdString, outcomeMemberDeleteHash))
    },
    startTitleEdit: (goalAddress) => {
      return dispatch(startTitleEdit(goalAddress))
    },
    endTitleEdit: (goalAddress) => {
      return dispatch(endTitleEdit(goalAddress))
    },
    startDescriptionEdit: (goalAddress) => {
      return dispatch(startDescriptionEdit(goalAddress))
    },
    endDescriptionEdit: (goalAddress) => {
      return dispatch(endDescriptionEdit(goalAddress))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpandedViewMode)
