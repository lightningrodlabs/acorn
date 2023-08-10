import _ from 'lodash'
import { z } from 'zod'

import { CREATE_TAG, FETCH_TAGS, UPDATE_TAG, DELETE_TAG } from './actions'
import { isCrud, crudReducer } from '../../crudRedux'
import {
  CellIdString,
  ActionHashB64,
  WithActionHash,
} from '../../../../types/shared'
import { Tag, TagSchema } from '../../../../types'

export const ProjectTagsStateSchema = z.record(
  z.object({ actionHash: z.string() }).merge(TagSchema)
)
export type ProjectTagsState = {
  [actionHash: ActionHashB64]: WithActionHash<Tag>
}

type TagState = {
  [cellId: CellIdString]: {
    [actionHash: ActionHashB64]: WithActionHash<Tag>
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
