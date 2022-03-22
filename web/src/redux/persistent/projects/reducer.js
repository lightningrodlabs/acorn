
import { combineReducers } from 'redux'

import members from './members/reducer'
import outcomes from './outcomes/reducer'
import connections from './connections/reducer'
import entryPoints from './entry-points/reducer'
import outcomeComments from './outcome-comments/reducer'
import outcomeMembers from './outcome-members/reducer'
import outcomeVotes from './outcome-votes/reducer'
import outcomeHistory from './outcome-history/reducer'
import projectMeta from './project-meta/reducer'

export default combineReducers({
  projectMeta,
  members,
  outcomes,
  connections,
  entryPoints,
  outcomeMembers,
  outcomeVotes,
  outcomeComments,
  outcomeHistory,
})
