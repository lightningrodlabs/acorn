import React from 'react'
import { connect } from 'react-redux'
import TextareaAutosize from 'react-textarea-autosize'
import moment from 'moment'

import { createGoalWithEdge, updateGoal } from '../../projects/goals/actions'
import { closeGoalForm, updateContent } from '../../goal-form/actions'

import './GoalTitleQuickEdit.css'
import { firstZoomThreshold, fontSize, fontSizeExtraLarge, fontSizeLarge, lineHeightMultiplier, secondZoomThreshold } from '../../drawing/dimensions'

// if editAddress is present (as a Goal address) it means we are currently EDITING that Goal
function GoalTitleQuickEdit({
  whoami,
  scale,
  // the value of the text input
  content,
  // (optional) the address of a Goal to connect this Goal to
  // in the case of creating a Goal
  fromAddress,
  // (optional) the relation (relation_as_{child|parent}) between the two
  // in the case of creating a Goal
  relation, 
  editAddress,
  // coordinates in css terms for the box
  leftEdgeXPosition,
  topEdgeYPosition,
  // existing or default properties of the goal
  status,
  description,
  hierarchy,
  time_frame,
  timestamp_created,
  is_imported,
  user_hash, // creator
  user_edit_hash, // editor
  // callbacks
  updateContent,
  createGoalWithEdge,
  updateGoal,
  closeGoalForm,
}) {
  /* EVENT HANDLERS */

  // when the text value changes
  const handleChange = (event) => {
    updateContent(event.target.value)
  }
  // when a key is pressed
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSubmit()
    }
  }
  // when the input comes into focus
  const handleFocus = (event) => {
    // select the text
    event.target.select()
  }
  // when the input leaves focus (not focused on editing title)
  const handleBlur = (event) => {
    // if creating a goal (not editing it)
    if (!editAddress) {
      event.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = (event) => {
    if (event) {
      // this is to prevent the page from refreshing
      // when the form is submitted, which is the
      // default behaviour
      event.preventDefault()
    }

    // do not allow submit with no content
    if (!content || content === '') {
      return
    }

    // depending on editAddress, this
    // might be an update to an existing...
    // otherwise it's a new Goal being created
    if (editAddress) {
      innerUpdateGoal()
    } else {
      innerCreateGoalWithEdge()
    }

    // reset the textarea value to empty
    updateContent('')
    closeGoalForm()
  }

  const innerCreateGoalWithEdge = () => {
    // dispatch the action to create a goal
    // with the contents from the form
    // inserted into it
    createGoalWithEdge(
      {
        content: content,
        timestamp_created: moment().unix(),
        // defaults
        user_edit_hash,
        user_hash,
        hierarchy,
        status,
        description,
        is_imported,
      },
      fromAddress ? { goal_address: fromAddress, relation } : null
    )
  }

  const innerUpdateGoal = () => {
    updateGoal(
      {
        // new
        user_edit_hash: whoami.entry.address,
        description: description,
        timestamp_updated: moment().unix(),
        // carryover
        content,
        user_hash,
        timestamp_created,
        hierarchy,
        status,
        time_frame,
        is_imported,
      },
      editAddress
    )
  }

  // the default
  let fontSizeToUse = fontSize
  if (scale < secondZoomThreshold) {
    fontSizeToUse = fontSizeExtraLarge
  } else if (scale < firstZoomThreshold) {
    fontSizeToUse = fontSizeLarge
  }
  const textStyle = {
    fontSize: fontSizeToUse,
    lineHeight: `${parseInt(fontSizeToUse) * lineHeightMultiplier}px`
  }

  return (
    <div
      className="goal-title-quick-edit-wrapper"
      style={{
        top: `${topEdgeYPosition}px`,
        left: `${leftEdgeXPosition}px`,
      }}
    >
      <form className="goal-title-quick-edit-form" onSubmit={handleSubmit}>
        <TextareaAutosize
          autoFocus
          placeholder="Add a title..."
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={textStyle}
        />
      </form>
    </div>
  )
}

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
        fromAddress,
        relation,
        editAddress,
        content,
        leftEdgeXPosition,
        topEdgeYPosition,
      }
    },
  } = state
  // use the values of the goal being edited,
  // or else, if this is not being edited, but created,
  // then use these defaults:
  const editingGoal = editAddress
    ? state.projects.goals[activeProject][editAddress]
    : null
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
  return {
    updateContent: (content) => {
      dispatch(updateContent(content))
    },
    createGoalWithEdge: (entry, maybe_linked_goal) => {
      return dispatch(
        createGoalWithEdge.create({
          cellIdString,
          payload: { entry, maybe_linked_goal },
        })
      )
    },
    updateGoal: (entry, address) => {
      return dispatch(
        updateGoal.create({ cellIdString, payload: { entry, address } })
      )
    },
    closeGoalForm: () => {
      dispatch(closeGoalForm())
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GoalTitleQuickEdit)
