import _ from 'lodash'

import { CREATE_TAG, FETCH_TAGS, UPDATE_TAG, DELETE_TAG } from './actions'
import { isCrud, crudReducer } from '../../crudRedux'
import {
  CellIdString,
  HeaderHashB64,
  WithHeaderHash,
} from '../../../../types/shared'
import { Tag } from '../../../../types'

type TagState = {
  [cellId: CellIdString]: {
    [headerHash: HeaderHashB64]: WithHeaderHash<Tag>
  }
}
const defaultState: TagState = {}

export default function (state: TagState = defaultState, action): TagState {
  // start out by checking whether this a standard CRUD operation
  if (isCrud(action, CREATE_TAG, FETCH_TAGS, UPDATE_TAG, DELETE_TAG)) {
    return crudReducer<Tag>(
      state,
      action,
      CREATE_TAG,
      FETCH_TAGS,
      UPDATE_TAG,
      DELETE_TAG
    )
  }

  return state
}
