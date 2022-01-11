/*
IMPORTANT NOTE

for now, remotely triggered create actions, and update actions, are just dispatching
the same events types, because their payload signatures match,
and the reducers handle them the same way
*/

import * as msgpack from '@msgpack/msgpack/dist'
import * as edgeActions from './projects/edges/actions'
import * as goalActions from './projects/goals/actions'
import * as goalVoteActions from './projects/goal-votes/actions'
import * as goalMemberActions from './projects/goal-members/actions'
import * as goalCommentActions from './projects/goal-comments/actions'
import * as entryPointActions from './projects/entry-points/actions'
import * as projectMetaActions from './projects/project-meta/actions'
import { setMember } from './projects/members/actions'
import { fetchAgents, setAgent } from './agents/actions'
import { cellIdToString } from 'connoropolous-hc-redux-middleware'
import { triggerUpdateLayout } from './layout/actions'
import { startTitleEdit, endTitleEdit, startDescriptionEdit, endDescriptionEdit } from './goal-editing/actions'

// We directly use the 'success' type, since these actions
// have already succeeded on another machine, and we're just reflecting them locally
function createSignalAction(holochainAction, cellId, payload) {
  return {
    type: holochainAction.success().type,
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

// all possible values of `payload.entryType` off a signal
const SignalType = {
  // Profiles Zome
  Agent: 'agent',
  // Projects Zome
  Edge: 'edge',
  EntryPoint: 'entry_point',
  Goal: 'goal',
  // custom signal type for a goal_with_edge
  // this is because it's important to the UI to receive both
  // the new goal, and the edge, at the same moment
  GoalWithEdge: 'goal_with_edge',
  // custom signal type for goal_fully_archived
  // this is because it's important to the UI to receive
  // both the archived goal, and everything connected to it that
  // has archived at the same time
  ArchiveGoalFully: 'archive_goal_fully',
  GoalComment: 'goal_comment',
  GoalMember: 'goal_member',
  GoalVote: 'goal_vote',
  Member: 'member',
  ProjectMeta: 'project_meta',
}
const nonEntrySignalTypes = {
  EditingGoal: 'EditingGoal'
}
const crudActionSets = {
  Edge: edgeActions,
  Goal: goalActions,
  GoalVote: goalVoteActions,
  GoalMember: goalMemberActions,
  GoalComment: goalCommentActions,
  EntryPoint: entryPointActions,
  ProjectMeta: projectMetaActions,
}
const crudTypes = {
  edge: 'Edge',
  goal: 'Goal',
  goal_vote: 'GoalVote',
  goal_member: 'GoalMember',
  goal_comment: 'GoalComment',
  entry_point: 'EntryPoint',
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
      actionPrefix = 'archive'
      break
    default:
      throw new Error('unknown actionType')
  }
  const actionSet = crudActionSets[entryTypeName]
  // such as `createGoalComment`
  const actionName = `${actionPrefix}${entryTypeName}`
  return actionSet[actionName]
}

export default (store) => (signal) => {
  const { cellId } = signal.data
  let { payload } = signal.data
  // TODO: update holochain-conductor-api to latest
  // which should deserialize this automatically
  payload = msgpack.decode(payload)

  // switch to CamelCasing if defined
  if (payload.signalType === nonEntrySignalTypes.EditingGoal) {
    // store.dispatch(
    //   startTitleEdit(payload.goal_address, payload.editing_agent)
    //   )
    // call triggerGoalEditSignal function
    triggerGoalEditSignal(store, payload.data)
    return
  }

  const crudType = crudTypes[payload.data.entryType]
  if (crudType) {
    const action = pickCrudAction(crudType, payload.data.action)
    store.dispatch(createSignalAction(action, cellId, payload.data.data))
    // in case of the special situation with archiving edges
    // where the layout reflow doesn't happen automatically
    // we have to manually trigger it to do so
    // the other cases are covered in src/layout/middleware.js ->
    // isOneOfLayoutAffectingActions()
    if (action.success().type === edgeActions.archiveEdge.success().type) {
      store.dispatch(triggerUpdateLayout())
    }
  }
  else {
    // otherwise use non-crud actions
    switch (payload.data.entryType) {
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
        // if (!stateCheck.agents[payload.data.headerHash]) {
        //   store.dispatch(
        //     fetchAgents.create({
        //       cellIdString: cellIdToString(cellId),
        //       payload: null,
        //     })
        //   )
        // }
        // this one is different than the rest on purpose
        // there's no "local action" equivalent
        store.dispatch(setMember(cellIdToString(cellId), payload.data.data))
        break
      case SignalType.GoalWithEdge:
        store.dispatch(
          createSignalAction(goalActions.createGoalWithEdge, cellId, payload.data.data)
        )
        break
      case SignalType.ArchiveGoalFully:
        store.dispatch(
          createSignalAction(goalActions.archiveGoalFully, cellId, payload.data.data)
        )
        break
      default:
        console.log('unrecognised entryType received: ', payload.data.entryType)
    }
  }
}
let titleEditTimeoutId = {} //is this a shared value accessible each time a signal is received?
let descriptionEditTimeoutId = {}
const signalTimeout = 5000
function endTitleEditDispatch(store, payload) {
  // remove the key value pair from here (to avoid calling clearTimeout when not necessary)
  delete titleEditTimeoutId[payload.goal_address]
  store.dispatch(endTitleEdit(payload.goal_address))
}
function endDescriptionEditDispatch(store, payload) {
  // remove the key value pair from here (to avoid calling clearTimeout when not necessary)
  delete descriptionEditTimeoutId[payload.goal_address]
  store.dispatch(endDescriptionEdit(payload.goal_address))
}
function triggerGoalEditSignal(store, payload) {
  // check for 4 cases and dispatch the appropriate action
  if (payload.is_editing) {
    if ("Title" in payload.goal_field) { // have to use this because using the default flat enum serialization of { Title: null }
      if (payload.goal_address in titleEditTimeoutId) {
        clearTimeout(titleEditTimeoutId[payload.goal_address])
        titleEditTimeoutId[payload.goal_address] = setTimeout(endTitleEditDispatch, signalTimeout, store, payload)
      }
      else {
        titleEditTimeoutId[payload.goal_address] = setTimeout(endTitleEditDispatch, signalTimeout, store, payload)
      }
      store.dispatch(startTitleEdit(payload.goal_address, payload.editing_agent))
    }
    else if ("Description" in payload.goal_field) {
      if (payload.goal_address in descriptionEditTimeoutId) {
        clearTimeout(descriptionEditTimeoutId[payload.goal_address])
        descriptionEditTimeoutId[payload.goal_address] = setTimeout(endDescriptionEditDispatch, signalTimeout, store, payload)
      }
      else {
        descriptionEditTimeoutId[payload.goal_address] = setTimeout(endDescriptionEditDispatch, signalTimeout, store, payload)
      }
      store.dispatch(startDescriptionEdit(payload.goal_address, payload.editing_agent))
    }
    else {
      console.log('unrecognized goal field type:', payload.goal_field)
    }
  }
  else {
    if ("Title" in payload.goal_field) { // have to use this because using the default flat enum serialization of { Title: null }
      store.dispatch(endTitleEdit(payload.goal_address))
    }
    else if ("Description" in payload.goal_field) {
      store.dispatch(endDescriptionEdit(payload.goal_address))
    }
    else {
      console.log('unrecognized goal field type:', payload.goal_field)
    }
  }
}