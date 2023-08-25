/*
This file is the top level reducer.
Import all the reducers from each feature here

"reducers" are the things that contain key application logic
of how ACTIONS affect STATE
*/

import { combineReducers } from 'redux'

import cells from './persistent/cells/reducer'
import agents from './persistent/profiles/agents/reducer'
import whoami, {
  hasFetchedForWhoami,
} from './persistent/profiles/who-am-i/reducer'
import agentAddress from './persistent/profiles/agent-address/reducer'
import projects from './persistent/projects/reducer'
import outcomeForm from './ephemeral/outcome-form/reducer'
import inviteMembersModal from './ephemeral/invite-members-modal/reducer'
import selection from './ephemeral/selection/reducer'
import hover from './ephemeral/hover/reducer'
import keyboard from './ephemeral/keyboard/reducer'
import layout from './ephemeral/layout/reducer'
import mouse from './ephemeral/mouse/reducer'
import screensize from './ephemeral/screensize/reducer'
import viewport from './ephemeral/viewport/reducer'
import depthPerception from './ephemeral/depth-perception/reducer'
import expandedView from './ephemeral/expanded-view/reducer'
import outcomeClone from './ephemeral/outcome-clone/reducer'
import activeProject from './ephemeral/active-project/reducer'
import activeEntryPoints from './ephemeral/active-entry-points/reducer'
import localPreferences from './ephemeral/local-preferences/reducer'
import outcomeConnector from './ephemeral/outcome-connector/reducer'
import outcomeEditing from './ephemeral/outcome-editing/reducer'
import realtimeInfo from './ephemeral/realtime-info/reducer'
import collapsedOutcomes from './ephemeral/collapsed-outcomes/reducer'
import mapViewSettings from './ephemeral/map-view-settings/reducer'
import navigationModal from './ephemeral/navigation-modal/reducer'
// import anotherone from './another/path'

// combine reducers from each feature to create the top-level reducer
const rootReducer = combineReducers({
  cells,
  agents,
  projects,
  whoami,
  agentAddress,
  ui: combineReducers({
    layout,
    inviteMembersModal,
    hasFetchedForWhoami,
    outcomeConnector,
    localPreferences,
    outcomeForm,
    selection,
    hover,
    keyboard,
    screensize,
    viewport,
    depthPerception,
    mouse,
    expandedView,
    outcomeClone,
    activeProject,
    activeEntryPoints,
    outcomeEditing,
    realtimeInfo,
    collapsedOutcomes,
    mapViewSettings,
    navigationModal,
  }), // ,
  // anotherone: anotherone
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
