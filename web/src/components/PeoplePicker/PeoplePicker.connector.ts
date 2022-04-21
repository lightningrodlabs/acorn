import { connect } from 'react-redux'
import moment from 'moment'
import {
  createOutcomeMember,
  deleteOutcomeMember,
} from '../../redux/persistent/projects/outcome-members/actions'
import { AgentPubKeyB64, HeaderHashB64 } from '../../types/shared'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import { RootState } from '../../redux/reducer'
import PeoplePicker, {
  PeoplePickerConnectorDispatchProps,
  PeoplePickerConnectorStateProps,
  PeoplePickerOwnProps,
} from './PeoplePicker.component'

function mapStateToProps(
  state: RootState,
  ownProps: PeoplePickerOwnProps
): PeoplePickerConnectorStateProps {
  const { projectId } = ownProps
  const outcomeHeaderHash = state.ui.outcomeForm.isOpen
    ? state.ui.outcomeForm.editAddress
    : state.ui.expandedView.outcomeHeaderHash
  const outcomeMembers = state.projects.outcomeMembers[projectId] || {}
  const members = state.projects.members[projectId] || {}
  const membersOfOutcome = Object.keys(outcomeMembers)
    .map((address) => outcomeMembers[address])
    .filter(
      (outcomeMember) => outcomeMember.outcomeHeaderHash === outcomeHeaderHash
    )

  // all project members, plus a bit of data about
  // whether the person is an assignee on a specific outcome
  // or not
  const people = Object.keys(members)
    .map((address) => state.agents[address])
    // just in case we've received a 'member' before the agents profile
    // filter out any missing profiles for now
    .filter((agent) => agent)
    .map((agent) => {
      const member = membersOfOutcome.find(
        (outcomeMember) => outcomeMember.memberAgentPubKey === agent.agentPubKey
      )
      return {
        ...agent, // address, name, avatarUrl
        isOutcomeMember: member ? true : false,
        outcomeMemberHeaderHash: member ? member.headerHash : null,
      }
    })

  return {
    activeAgentPubKey: state.agentAddress,
    people,
    outcomeHeaderHash,
  }
}

function mapDispatchToProps(
  dispatch,
  ownProps: PeoplePickerOwnProps
): PeoplePickerConnectorDispatchProps {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    createOutcomeMember: async (
      outcomeHeaderHash: HeaderHashB64,
      memberAgentPubKey: AgentPubKeyB64,
      creatorAgentPubKey: AgentPubKeyB64
    ) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeMember = await projectsZomeApi.outcomeMember.create(cellId, {
        outcomeHeaderHash,
        memberAgentPubKey: memberAgentPubKey,
        creatorAgentPubKey,
        unixTimestamp: moment().unix(),
        isImported: false,
      })
      return dispatch(createOutcomeMember(cellIdString, outcomeMember))
    },
    deleteOutcomeMember: async (headerHash: HeaderHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      await projectsZomeApi.outcomeMember.delete(cellId, headerHash)
      return dispatch(deleteOutcomeMember(cellIdString, headerHash))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PeoplePicker)
