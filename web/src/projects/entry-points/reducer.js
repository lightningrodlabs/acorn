
import _ from 'lodash'

import {
  createEntryPoint,
  fetchEntryPoints,
  updateEntryPoint,
  archiveEntryPoint,
} from './actions'
import { archiveGoalFully } from '../goals/actions'
import { isCrud, crudReducer } from '../../crudRedux'

// state is at the highest level an object with cellIds
// which are like Projects... EntryPoints exist within Projects
// so they are contained per project in the top level state

// state is an object where the keys are the entry addresses of "EntryPoints"
// and the values are modified versions of the EntryPoint data structures that
// also contain their address on those objects
const defaultState = {}

export default function (state = defaultState, action) {
  if (
    isCrud(
      action,
      createEntryPoint,
      fetchEntryPoints,
      updateEntryPoint,
      archiveEntryPoint
    )
  ) {
    return crudReducer(
      state,
      action,
      createEntryPoint,
      fetchEntryPoints,
      updateEntryPoint,
      archiveEntryPoint
    )
  }

  const { payload, type } = action
  switch (type) {
    case archiveGoalFully.success().type:
      const cellId = action.meta.cellIdString
      // filter out the entry points whose addresses are listed as having been
      // archived on account of having archived its associated Goal
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (_value, key) => payload.archived_entry_points.indexOf(key) === -1
        ),
      }
    default:
      return state
  }
}
