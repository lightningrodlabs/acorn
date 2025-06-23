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
import {
  createTag,
  updateTag,
} from '../../../../../redux/persistent/projects/tags/actions'
import selectProjectMembersPresent from '../../../../../redux/persistent/projects/realtime-info-signal/select'
import { RootState } from '../../../../../redux/reducer'
import { AssigneeWithActionHash, Outcome } from '../../../../../types'
import { ActionHashB64, AgentPubKeyB64 } from '../../../../../types/shared'
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
  const outcomeActionHash = state.ui.expandedView.outcomeActionHash
  const outcomeMembers = state.projects.outcomeMembers[projectId] || {}
  const tags = state.projects.tags[projectId] || {}
  const projectTags = Object.values(tags)

  const presentMembers = projectId
    ? selectProjectMembersPresent(state, projectId)
    : []

  // assignees
  let assignees: AssigneeWithActionHash[] = []
  if (outcomeActionHash) {
    assignees = Object.keys(outcomeMembers)
      .map((actionHash) => outcomeMembers[actionHash])
      .filter(
        (outcomeMember) => outcomeMember.outcomeActionHash === outcomeActionHash
      )
      .map((outcomeMember) => {
        const assignee = {
          profile: state.projects.members[projectId].profiles.find(p => p.agentPubKey === outcomeMember.memberAgentPubKey),
          outcomeMemberActionHash: outcomeMember.actionHash,
        }
        return assignee
      })
  }

  // people
  // all project members, plus 'ghosts', plus a bit of data about
  // whether the person is an assignee on a specific outcome
  // or not
  const projectMembers = state.projects.members[projectId].members || {}
  const membersOfOutcome = Object.keys(outcomeMembers)
    .map((actionHash) => outcomeMembers[actionHash])
    .filter(
      (outcomeMember) => outcomeMember.outcomeActionHash === outcomeActionHash
    )
  const allRelevantPeopleAddresses = Object.keys(projectMembers)
  //handle ghosts by including them, they will only appear if they are 'assigned'
  membersOfOutcome.forEach((memberOfOutcome) => {
    if (
      !allRelevantPeopleAddresses.includes(memberOfOutcome.memberAgentPubKey)
    ) {
      allRelevantPeopleAddresses.push(memberOfOutcome.memberAgentPubKey)
    }
  })
  const people = allRelevantPeopleAddresses
    .map((address) => state.projects.members[projectId].profiles.find(p => p.agentPubKey === address))
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
        outcomeMemberActionHash: member ? member.actionHash : null,
      }
    })

  function filterAndAddAgentInfo(agentInfo) {
    return {
      ...agentInfo,
      profileInfo: state.projects.members[projectId].profiles.find(p => p.agentPubKey === agentInfo.agentPubKey),
    }
  }
  const editingPeers = Object.values(state.ui.realtimeInfo)
    .filter((agentInfo) => agentInfo.outcomeBeingEdited)
    .filter(
      (agentInfo) =>
        agentInfo.outcomeBeingEdited.outcomeActionHash === outcomeActionHash
    )
    .filter((agentInfo) => agentInfo.agentPubKey !== state.agentAddress) // don't include self
    .map((agentInfo) => filterAndAddAgentInfo(agentInfo))
  // this should only ever by a maximum of two peers (one editing title, one editing description)

  return {
    outcomeActionHash,
    projectTags,
    activeAgentPubKey: state.agentAddress,
    presentMembers,
    editingPeers,
    assignees,
    people,
  }
}

function mapDispatchToProps(
  dispatch: any,
  ownProps: EvDetailsOwnProps
): EvDetailsConnectorDispatchProps {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    onCreateTag: async (text: string, backgroundColor: string) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const createdTag = await projectsZomeApi.tag.create(cellId, {
        text,
        backgroundColor,
      })
      return dispatch(createTag(cellIdString, createdTag))
    },
    onUpdateExistingTag: async (actionHash, text, backgroundColor) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedExistingTag = await projectsZomeApi.tag.update(cellId, {
        actionHash,
        entry: { text, backgroundColor },
      })
      return dispatch(updateTag(cellIdString, updatedExistingTag))
    },
    createOutcomeMember: async (
      outcomeActionHash: ActionHashB64,
      memberAgentPubKey: AgentPubKeyB64,
      creatorAgentPubKey: AgentPubKeyB64
    ) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeMember = await projectsZomeApi.outcomeMember.create(cellId, {
        outcomeActionHash,
        memberAgentPubKey: memberAgentPubKey,
        creatorAgentPubKey,
        unixTimestamp: moment().unix(),
        isImported: false,
      })
      return dispatch(createOutcomeMember(cellIdString, outcomeMember))
    },
    deleteOutcomeMember: async (actionHash: ActionHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      await projectsZomeApi.outcomeMember.delete(cellId, actionHash)
      return dispatch(deleteOutcomeMember(cellIdString, actionHash))
    },
    startTitleEdit: (outcomeActionHash: ActionHashB64) => {
      return dispatch(startTitleEdit(outcomeActionHash))
    },
    endTitleEdit: (outcomeActionHash: ActionHashB64) => {
      return dispatch(endTitleEdit(outcomeActionHash))
    },
    startDescriptionEdit: (outcomeActionHash: ActionHashB64) => {
      return dispatch(startDescriptionEdit(outcomeActionHash))
    },
    endDescriptionEdit: (outcomeActionHash: ActionHashB64) => {
      return dispatch(endDescriptionEdit(outcomeActionHash))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EvDetails)
