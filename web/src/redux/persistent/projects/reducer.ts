import { combineReducers } from 'redux'

import members from './members/reducer'
import outcomes from './outcomes/reducer'
import connections from './connections/reducer'
import entryPoints from './entry-points/reducer'
import outcomeComments from './outcome-comments/reducer'
import outcomeMembers from './outcome-members/reducer'
import outcomeHistory from './outcome-history/reducer'
import projectMeta from './project-meta/reducer'
import tags from './tags/reducer'

export default combineReducers({
  projectMeta,
  members,
  tags,
  outcomes,
  connections,
  entryPoints,
  outcomeMembers,
  outcomeComments,
  outcomeHistory,
})
