/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/
import { Tag } from '../../../../types'
import { createCrudActionCreators } from '../../crudRedux'

/* action creator functions */

const [[
  CREATE_TAG,
  FETCH_TAGS,
  UPDATE_TAG,
  DELETE_TAG
],[
  createTag,
  fetchTags,
  updateTag,
  deleteTag
]] = createCrudActionCreators<Tag>('TAG')


export {
  CREATE_TAG,
  FETCH_TAGS,
  UPDATE_TAG,
  DELETE_TAG,
  createTag,
  fetchTags,
  updateTag,
  deleteTag,
}
