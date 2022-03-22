import { connect } from 'react-redux'
import {
  createOutcomeMember,
  deleteOutcomeMember,
} from '../../redux/persistent/projects/outcome-members/actions'
import moment from 'moment'
import PeoplePicker from './PeoplePicker.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'

function mapStateToProps(state, ownProps) {
  const outcomeAddress = state.ui.outcomeForm.isOpen
    ? state.ui.outcomeForm.editAddress
    : state.ui.expandedView.outcomeAddress
  const { projectId } = ownProps
  const outcomeMembers = state.projects.outcomeMembers[projectId] || {}
  const members = state.projects.members[projectId] || {}
  const membersOfOutcome = Object.keys(outcomeMembers)
    .map((address) => outcomeMembers[address])
    .filter((outcomeMember) => outcomeMember.outcomeAddress === outcomeAddress)
  // just in case we've received a 'member' before the agents profile
  // filter out any missing profiles for now
  const agents = Object.keys(members).map((address) => state.agents[address]).filter((agent) => agent)
  return {
    agentAddress: state.agentAddress,
    people: agents.map((agent) => {
      const member = membersOfOutcome.find(
        (outcomeMember) => outcomeMember.agentAddress === agent.address
      )
        console.log(member)
      return {
        ...agent, // address, name, avatarUrl
        is_member: member ? true : false,
        outcome_member_address: member ? member.headerHash : null,
      }
    }),
    outcomeAddress,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    createOutcomeMember: async (outcomeAddress, agentAddress, userEditHash) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeMember = await projectsZomeApi.outcomeMember.create(cellId, {
        outcomeAddress,
        agentAddress,
        userEditHash,
        unixTimestamp: moment().unix(),
        isImported: false
      })
      return dispatch(
        createOutcomeMember(cellIdString, outcomeMember)
        )
      },
    deleteOutcomeMember: async (payload) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const deleteOutcomeMemberHash = await projectsZomeApi.outcomeMember.delete(cellId, payload)
      return dispatch(deleteOutcomeMember(cellIdString, deleteOutcomeMemberHash))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PeoplePicker)
