import { connect } from 'react-redux'
import {
  createOutcomeMember,
  deleteOutcomeMember,
} from '../../redux/persistent/projects/goal-members/actions'
import moment from 'moment'
import PeoplePicker from './PeoplePicker.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'

function mapStateToProps(state, ownProps) {
  const goalAddress = state.ui.goalForm.isOpen
    ? state.ui.goalForm.editAddress
    : state.ui.expandedView.goalAddress
  const { projectId } = ownProps
  const goalMembers = state.projects.goalMembers[projectId] || {}
  const members = state.projects.members[projectId] || {}
  const membersOfGoal = Object.keys(goalMembers)
    .map((address) => goalMembers[address])
    .filter((goalMember) => goalMember.goal_address === goalAddress)
  // just in case we've received a 'member' before the agents profile
  // filter out any missing profiles for now
  const agents = Object.keys(members).map((address) => state.agents[address]).filter((agent) => agent)
  return {
    agentAddress: state.agentAddress,
    people: agents.map((agent) => {
      const member = membersOfGoal.find(
        (goalMember) => goalMember.agent_address === agent.address
      )
        console.log(member)
      return {
        ...agent, // address, name, avatar_url
        is_member: member ? true : false,
        goal_member_address: member ? member.headerHash : null,
      }
    }),
    goalAddress,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    createGoalMember: async (goal_address, agent_address, user_edit_hash) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeMember = await projectsZomeApi.outcomeMember.create(cellId, {
        goal_address,
        agent_address,
        user_edit_hash,
        unix_timestamp: moment().unix(),
        is_imported: false
      })
      return dispatch(
        createOutcomeMember(cellIdString, outcomeMember)
        )
      },
    archiveGoalMember: async (payload) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const deleteOutcomeMemberHash = await projectsZomeApi.outcomeMember.delete(cellId, payload)
      return dispatch(deleteOutcomeMember(cellIdString, deleteOutcomeMemberHash))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PeoplePicker)
