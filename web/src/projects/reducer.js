
import { combineReducers } from 'redux'

import members from './members/reducer'
import goals from './goals/reducer'
import edges from './edges/reducer'
import entryPoints from './entry-points/reducer'
import goalComments from './goal-comments/reducer'
import goalMembers from './goal-members/reducer'
import goalVotes from './goal-votes/reducer'
import goalHistory from './goal-history/reducer'
import projectMeta from './project-meta/reducer'

export default combineReducers({
  projectMeta,
  members,
  goals,
  edges,
  entryPoints,
  goalMembers,
  goalVotes,
  goalComments,
  goalHistory,
})
