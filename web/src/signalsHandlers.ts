/*
IMPORTANT NOTE

for now, remotely triggered create actions, and update actions, are just dispatching
the same events types, because their payload signatures match,
and the reducers handle them the same way
*/

import * as msgpack from '@msgpack/msgpack/dist'
import * as connectionActions from './redux/persistent/projects/connections/actions'
import * as outcomeActions from './redux/persistent/projects/outcomes/actions'
import * as tagActions from './redux/persistent/projects/tags/actions'
import * as outcomeMemberActions from './redux/persistent/projects/outcome-members/actions'
import * as outcomeCommentActions from './redux/persistent/projects/outcome-comments/actions'
import * as entryPointActions from './redux/persistent/projects/entry-points/actions'
import * as projectMetaActions from './redux/persistent/projects/project-meta/actions'
import { setMember } from './redux/persistent/projects/members/actions'
import { setAgent } from './redux/persistent/profiles/agents/actions'
import { triggerUpdateLayout } from './redux/ephemeral/layout/actions'
import {
  removePeerState,
  updatePeerState,
} from './redux/ephemeral/realtime-info/actions'
import { cellIdToString } from './utils'
import {
  AppSignal,
  Signal,
  SignalCb,
  SignalType as HcSignalType,
} from '@holochain/client'

// We directly use the 'success' type, since these actions
// have already succeeded on another machine, and we're just reflecting them locally
function createSignalAction(holochainAction, cellId, payload) {
  return {
    type: holochainAction,
    payload,
    meta: {
      cellIdString: cellIdToString(cellId),
    },
  }
}

// all possible values of `payload.action` off a signal
const ActionType = {
  Create: 'create',
  Update: 'update',
  Delete: 'delete',
}

// all possible values of `payload.signalType` off a signal
const SignalType = {
  // Profiles Zome
  Agent: 'Agent',
  // Projects Zome
  Connection: 'Connection',
  EntryPoint: 'EntryPoint',
  Outcome: 'Outcome',
  Tag: 'Tag',
  // custom signal type for an Outcome_with_connection
  // this is because it's important to the UI to receive both
  // the new outcome, and the connection, at the same moment
  OutcomeWithConnection: 'OutcomeWithConnection',
  // custom signal type for outcome_fully_deleted
  // this is because it's important to the UI to receive
  // both the deleted outcome, and everything connected to it that
  // has deleted at the same time
  DeleteOutcomeFully: 'DeleteOutcomeFully',
  OutcomeComment: 'OutcomeComment',
  OutcomeMember: 'OutcomeMember',
  OutcomeVote: 'OutcomeVote',
  Member: 'Member',
  ProjectMeta: 'ProjectMeta',
}
const nonEntrySignalTypes = {
  RealtimeInfo: 'RealtimeInfo',
}
const crudActionSets = {
  Connection: connectionActions,
  Outcome: outcomeActions,
  OutcomeMember: outcomeMemberActions,
  OutcomeComment: outcomeCommentActions,
  EntryPoint: entryPointActions,
  Tag: tagActions,
  ProjectMeta: projectMetaActions,
}
const crudTypes = {
  connection: 'Connection',
  outcome: 'Outcome',
  outcome_vote: 'OutcomeVote',
  outcome_member: 'OutcomeMember',
  outcome_comment: 'OutcomeComment',
  entry_point: 'EntryPoint',
  tag: 'Tag',
  project_meta: 'ProjectMeta', // only 'update' is default crud
}

// entryTypeName = CamelCase
const pickCrudAction = (entryTypeName, actionType) => {
  // these all follow a pattern, on account of the fact that they used
  // createCrudActionCreators to set themselves up
  let actionPrefix
  switch (actionType) {
    case ActionType.Create:
      actionPrefix = 'create'
      break
    case ActionType.Update:
      actionPrefix = 'update'
      break
    case ActionType.Delete:
      actionPrefix = 'delete'
      break
    default:
      throw new Error('unknown actionType')
  }
  const actionSet = crudActionSets[entryTypeName]
  // such as `createOutcomeComment`
  const actionName = `${actionPrefix}${entryTypeName}`
  return actionSet[actionName](null, null).type
}

export default (store): SignalCb => {
  // keep track of timer set by setTimeout for each peer sending signals to you
  // needs to be in this scope so that it is accessible each time a signal is received
  const timerIds = {}
  return (signal: Signal) => {
    if (signal.type === HcSignalType.System) {
    }
    let { cell_id: cellId, payload: signalPayload } = signal.value as AppSignal
    let waitForNextSignal = 12000
    // TODO: update holochain-conductor-api to latest
    // which should deserialize this automatically
    const payload: any = msgpack.decode(signalPayload as Uint8Array)

    if (payload.signalType === nonEntrySignalTypes.RealtimeInfo) {
      // set timeout, and end any existing timeouts
      if (timerIds[payload.data.agentPubKey]) {
        clearTimeout(timerIds[payload.data.agentPubKey])
      }
      timerIds[payload.data.agentPubKey] = setTimeout(
        () => store.dispatch(removePeerState(payload.data.agentPubKey)),
        waitForNextSignal
      )
      triggerRealtimeInfoAction(store, payload.data)
      return
    }

    const crudType = crudTypes[payload.data.entryType]
    if (crudType) {
      const action = pickCrudAction(crudType, payload.data.action)
      store.dispatch(createSignalAction(action, cellId, payload.data.data))
      // in case of the special situation with archiving connections
      // where the layout reflow doesn't happen automatically
      // we have to manually trigger it to do so
      // the other cases are covered in src/layout/middleware.js ->
      if (action === connectionActions.DELETE_CONNECTION) {
        store.dispatch(triggerUpdateLayout())
      }
    } else {
      // otherwise use non-crud actions
      switch (payload.signalType) {
        /*
          PROFILES Zome
        */
        case SignalType.Agent:
          // this one is different than the rest on purpose
          // there's no "local action" equivalent
          store.dispatch(setAgent(payload.data.data))
          break
        /* 
          PROJECTS Zomes
        */
        case SignalType.Member:
          const stateCheck = store.getState()
          // check if this member is in our list of agents whose
          // profiles we already have, if not, then we should
          // refetch the agents list
          // TODO: re-enable this when there's a straightforward way to have the CellId
          // for the Profiles Cell here, not the Projects CellId which it currently has access to.
          // This was the source of a breaking bug
          // if (!stateCheck.agents[payload.data.actionHash]) {
          //   store.dispatch(
          //     fetchAgents.create({
          //       cellIdString: cellIdToString(cellId),
          //       payload: null,
          //     })
          //   )
          // }
          // this one is different than the rest on purpose
          // there's no "local action" equivalent
          store.dispatch(setMember(cellIdToString(cellId), payload.data.data)) //payload.data.data is type Member, not WireRecord<Member>
          break
        case SignalType.OutcomeWithConnection:
          console.log('check!')
          store.dispatch(
            createSignalAction(
              outcomeActions.CREATE_OUTCOME_WITH_CONNECTION,
              cellId,
              payload.data.data
            )
          )
          break
        case SignalType.DeleteOutcomeFully:
          store.dispatch(
            createSignalAction(
              outcomeActions.DELETE_OUTCOME_FULLY,
              cellId,
              payload.data.data
            )
          )
          break
        default:
          console.log('unrecognised signalType received: ', payload.signalType)
      }
    }
  }
}
function triggerRealtimeInfoAction(store, payload) {
  if (payload.projectId.length === 0) {
    store.dispatch(removePeerState(payload.agentPubKey))
  } else {
    store.dispatch(updatePeerState(payload))
  }
}
