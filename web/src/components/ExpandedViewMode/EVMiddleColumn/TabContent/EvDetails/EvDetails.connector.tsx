import moment from 'moment'
import { connect } from 'react-redux'
import ProjectsZomeApi from '../../../../../api/projectsApi'
import { getAppWs } from '../../../../../hcWebsockets'
import {
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
} from '../../../../../redux/ephemeral/outcome-editing/actions'
import {
  createOutcomeMember,
  deleteOutcomeMember,
} from '../../../../../redux/persistent/projects/outcome-members/actions'
import { updateOutcome } from '../../../../../redux/persistent/projects/outcomes/actions'
import { createTag } from '../../../../../redux/persistent/projects/tags/actions'
import { RootState } from '../../../../../redux/reducer'
import { AssigneeWithHeaderHash, Outcome } from '../../../../../types'
import { HeaderHashB64, AgentPubKeyB64 } from '../../../../../types/shared'
import { cellIdFromString } from '../../../../../utils'
import EvDetails, {
  EvDetailsConnectorDispatchProps,
  EvDetailsConnectorStateProps,
  EvDetailsOwnProps,
} from './EvDetails.component'

function mapStateToProps(
  state: RootState,
  ownProps: EvDetailsOwnProps
): EvDetailsConnectorStateProps {
  const { projectId } = ownProps
  const outcomeHeaderHash = state.ui.expandedView.outcomeHeaderHash
  const outcomeMembers = state.projects.outcomeMembers[projectId] || {}
  const tags = state.projects.tags[projectId] || {}
  const projectTags = Object.values(tags)

  // assignees
  let assignees: AssigneeWithHeaderHash[] = []
  if (outcomeHeaderHash) {
    assignees = Object.keys(outcomeMembers)
      .map((headerHash) => outcomeMembers[headerHash])
      .filter(
        (outcomeMember) => outcomeMember.outcomeHeaderHash === outcomeHeaderHash
      )
      .map((outcomeMember) => {
        const assignee = {
          profile: state.agents[outcomeMember.memberAgentPubKey],
          outcomeMemberHeaderHash: outcomeMember.headerHash,
        }
        return assignee
      })
  }

  // people
  // all project members, plus a bit of data about
  // whether the person is an assignee on a specific outcome
  // or not
  const members = state.projects.members[projectId] || {}
  const membersOfOutcome = Object.keys(outcomeMembers)
    .map((address) => outcomeMembers[address])
    .filter(
      (outcomeMember) => outcomeMember.outcomeHeaderHash === outcomeHeaderHash
    )
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

  // TODO: fix this fn
  // it shouldn't use `delete`
  // editingPeers
  function filterAndAddAgentInfo(agentInfo) {
    delete agentInfo.projectId
    delete agentInfo.outcomeExpandedView
    agentInfo.profileInfo = state.agents[agentInfo.agentPubKey]
    return agentInfo
  }
  const editingPeers = Object.values(state.ui.realtimeInfo)
    .filter((agentInfo) => agentInfo.outcomeBeingEdited)
    .filter(
      (agentInfo) =>
        agentInfo.outcomeBeingEdited.outcomeHeaderHash === outcomeHeaderHash
    )
    .map((agentInfo) => filterAndAddAgentInfo(agentInfo))
  // this should only ever by a maximum of two peers (one editing title, one editing description)

  return {
    outcomeHeaderHash,
    projectTags,
    activeAgentPubKey: state.agentAddress,
    profiles: state.agents,
    editingPeers,
    assignees,
    people,
  }
}

function mapDispatchToProps(
  dispatch,
  ownProps: EvDetailsOwnProps
): EvDetailsConnectorDispatchProps {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    onSaveTag: async (text: string, backgroundColor: string) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const createdTag = await projectsZomeApi.tag.create(cellId, {
        text,
        backgroundColor,
      })
      return dispatch(createTag(cellIdString, createdTag))
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
      console.log('deleted outcome member')
      return dispatch(deleteOutcomeMember(cellIdString, headerHash))
    },
    startTitleEdit: (outcomeHeaderHash: HeaderHashB64) => {
      return dispatch(startTitleEdit(outcomeHeaderHash))
    },
    endTitleEdit: (outcomeHeaderHash: HeaderHashB64) => {
      return dispatch(endTitleEdit(outcomeHeaderHash))
    },
    startDescriptionEdit: (outcomeHeaderHash: HeaderHashB64) => {
      return dispatch(startDescriptionEdit(outcomeHeaderHash))
    },
    endDescriptionEdit: (outcomeHeaderHash: HeaderHashB64) => {
      return dispatch(endDescriptionEdit(outcomeHeaderHash))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EvDetails)
