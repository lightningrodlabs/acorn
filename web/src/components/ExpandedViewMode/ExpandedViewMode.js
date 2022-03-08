import { connect } from 'react-redux'
import {
  createEntryPoint,
  archiveEntryPoint,
} from '../../redux/persistent/projects/entry-points/actions'
import { updateGoal } from '../../redux/persistent/projects/goals/actions'
import { archiveGoalMember } from '../../redux/persistent/projects/goal-members/actions'
import { startTitleEdit, endTitleEdit, startDescriptionEdit, endDescriptionEdit } from '../../redux/ephemeral/goal-editing/actions'
import ExpandedViewMode from './ExpandedViewMode.component'

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
      goalComment => goalComment.goal_address === state.ui.expandedView.goalAddress
    )
    squirrels = Object.keys(goalMembers)
      .map(headerHash => goalMembers[headerHash])
      .filter(goalMember => goalMember.goal_address === goal.headerHash)
      .map(goalMember => {
        const squirrel = {
          ...state.agents[goalMember.agent_address],
          goalMemberAddress: goalMember.headerHash
        }
        return squirrel
      })
    Object.keys(state.agents).forEach(value => {
      if (state.agents[value].address === goal.user_hash)
        creator = state.agents[value]
    })
  }

  const goalAddress = state.ui.expandedView.goalAddress
  const entryPoint = Object.values(entryPoints).find(
    entryPoint => entryPoint.goal_address === goalAddress
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
    .filter((agentInfo) => agentInfo.goalBeingEdited.goalAddress === goalAddress)
    .map((agentInfo) => 
      filterAndAddAgentInfo(agentInfo)
    )
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
    editingPeers
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    createEntryPoint: payload => {
      return dispatch(createEntryPoint.create({ cellIdString, payload }))
    },
    archiveEntryPoint: payload => {
      return dispatch(archiveEntryPoint.create({ cellIdString, payload }))
    },
    updateGoal: (entry, headerHash) => {
      return dispatch(
        updateGoal.create({ cellIdString, payload: { headerHash, entry } })
      )
    },
    archiveGoalMember: payload => {
      return dispatch(archiveGoalMember.create({ cellIdString, payload }))
    },
    startTitleEdit: goalAddress => {
      return dispatch(startTitleEdit(goalAddress))
    },
    endTitleEdit: goalAddress => {
      return dispatch(endTitleEdit(goalAddress))
    },
    startDescriptionEdit: goalAddress => {
      return dispatch(startDescriptionEdit(goalAddress))
    },
    endDescriptionEdit: goalAddress => {
      return dispatch(endDescriptionEdit(goalAddress))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpandedViewMode)
