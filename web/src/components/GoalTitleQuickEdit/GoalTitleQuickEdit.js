import React, { useRef } from 'react'
import { connect } from 'react-redux'
import useOnClickOutside from 'use-onclickoutside'
import TextareaAutosize from 'react-textarea-autosize'
import moment from 'moment'

import { createGoalWithEdge, updateGoal } from '../../redux/persistent/projects/goals/actions'
import { layoutAffectingArchiveEdge } from '../../redux/persistent/projects/edges/actions'
import { closeGoalForm, updateContent } from '../../redux/ephemeral/goal-form/actions'

import './GoalTitleQuickEdit.scss'
import { firstZoomThreshold, fontSize, fontSizeExtraLarge, fontSizeLarge, lineHeightMultiplier, secondZoomThreshold } from '../../drawing/dimensions'
import { startTitleEdit, endTitleEdit } from '../../redux/ephemeral/goal-editing/actions'
import GoalTitleQuickEdit from './GoalTitleQuickEdit.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'

// https://react-redux.js.org/using-react-redux/connect-mapstate
// Designed to grab selective data off of a redux state tree in order
// to pass it to a component for rendering, as specific properties that
// that component expects

function mapStateToProps(state) {
  const {
    ui: {
      activeProject,
      screensize: { width },
      viewport: { scale },
      // all the state for this component is store under state->ui->goalForm
      goalForm: {
        editAddress,
        content,
        leftEdgeXPosition,
        topEdgeYPosition,
        // these three go together
        fromAddress,
        relation,
        // ASSUMPTION: one parent
        existingParentEdgeAddress, // this is optional though
      }
    },
  } = state
  // use the values of the goal being edited,
  // or else, if this is not being edited, but created,
  // then use these defaults:
  const editingGoal = editAddress
    ? state.projects.goals[activeProject][editAddress]
    : null
  // this value of state.whoami.entry.address
  // should not be changed to headerHash unless the entry type of Profile
  // is changed
  const user_hash = editAddress ? editingGoal.user_hash : state.whoami.entry.address
  const user_edit_hash = editAddress ? state.whoami.entry.address : null
  const status = editAddress ? editingGoal.status : 'Uncertain'
  const description = editAddress ? editingGoal.description : ''
  const hierarchy = editAddress ? editingGoal.hierarchy : 'NoHierarchy'
  const time_frame = editAddress ? editingGoal.time_frame : null
  const timestamp_created = editAddress ? editingGoal.timestamp_created : null
  const is_imported = editAddress ? editingGoal.is_imported : false

  let goalCoord
  if (editAddress) {
    goalCoord = state.ui.layout[editAddress]
  }

  return {
    whoami: state.whoami,
    scale,
    editAddress,
    // optional, the address of the Goal that we are relating this to
    fromAddress,
    // optional, the relation (relation_as_{child|parent})
    // between the potential fromAddress Goal
    // and a new Goal to be created
    relation,
    // optional, the address of an existing edge that
    // indicates this Goal as the child of another (a.k.a has a parent)
    // ASSUMPTION: one parent
    existingParentEdgeAddress,
    content,
    leftEdgeXPosition: editAddress ? goalCoord.x : leftEdgeXPosition,
    topEdgeYPosition: editAddress ? goalCoord.y : topEdgeYPosition,
    // default states for the goal when creating it
    // plus existing fields for "edit"
    user_hash,
    user_edit_hash,
    status,
    description,
    hierarchy,
    time_frame,
    timestamp_created,
    is_imported
  }
}

// https://react-redux.js.org/using-react-redux/connect-mapdispatch
// Designed to pass functions into components which are already wrapped as
// action dispatchers for redux action types

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  return {
    updateContent: (content) => {
      dispatch(updateContent(content))
    },
    archiveEdge: (address) => {
      // false because we will only be archiving
      // an edge here in the context of immediately replacing
      // it with another during a createGoalWithEdge
      // thus we don't want a glitchy animation
      const affectLayout = false
      return dispatch(
        layoutAffectingArchiveEdge(
          cellIdString,
          address,
          affectLayout
        )
      )
    },
    createGoalWithEdge: (entry, maybe_linked_goal) => {
      // this api function is not being picked up by intellisense
      const outcomeWithConnection = await projectsZomeApi.outcome.createOutcomeWithConnection(cellId, {
        entry,
        maybe_linked_goal //TODO: should we make this serde camelCase?
      })
      return dispatch(
        createGoalWithEdge(
          cellIdString,
          outcomeWithConnection
        )
      )
    },
    updateGoal: (entry, headerHash) => {
      const updatedOutcome = await projectsZomeApi.outcome.update(cellId, {entry, headerHash })
      return dispatch(
        updateGoal(cellIdString, updatedOutcome)
      )
    },
    closeGoalForm: () => {
      dispatch(closeGoalForm())
    },
    startTitleEdit: goalAddress => {
      return dispatch(startTitleEdit(goalAddress))
    },
    endTitleEdit: goalAddress => {
      return dispatch(endTitleEdit(goalAddress))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GoalTitleQuickEdit)
