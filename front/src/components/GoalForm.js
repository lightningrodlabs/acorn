import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import TextareaAutosize from 'react-textarea-autosize'

import { createGoalWithEdge, updateGoal } from '../projects/goals/actions'
import { closeGoalForm, updateContent } from '../goal-form/actions'
import layoutFormula from '../drawing/layoutFormula'
import { goalWidth } from '../drawing/dimensions'
import moment from 'moment'
import VerticalActionsList from './VerticalActionsList'

// a React Component is defined as a class that extends the basic
// React Component class. Usually of the form
// class MyComponent extends Component
class GoalForm extends Component {
  constructor() {
    // calls the constructor of the `super` (parent) class,
    // which does its own initialization steps.
    // important, always call this.
    super()

    // always required to make sure that functions defined on the class
    // have the proper `this` scope attached to them.
    // its a weird oddity of JS and React,
    // don't question it, just do it.
    this.handleFocus = this.handleFocus.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.createGoal = this.createGoal.bind(this)
    this.updateGoal = this.updateGoal.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
  }

  /*
    EVENT HANDLERS
  */
  handleFocus(event) {
    event.target.select()
  }
  handleChange(event) {
    this.props.updateContent(event.target.value)
  }
  handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.handleSubmit()
    }
  }

  handleBlur(event) {
    if (!this.props.editAddress) {
      event.preventDefault()
      this.handleSubmit()
    }
  }

  handleSubmit(event) {
    if (event) {
      // this is to prevent the page from refreshing
      // when the form is submitted, which is the
      // default behaviour
      event.preventDefault()
    }

    if (!this.props.content || this.props.content === '') {
      return
    }

    // depending on editAddress, this
    // might be an update to an existing...
    // otherwise it's a new Goal being created
    if (this.props.editAddress) {
      this.updateGoal()
    } else {
      this.createGoal()
    }

    // reset the textarea value to empty
    this.props.updateContent('')
    this.props.closeGoalForm()
  }

  async createGoal() {
    // dispatch the action to create a goal
    // with the contents from the form
    // inserted into it
    this.props.createGoalWithEdge(
      {
        content: this.props.content,
        user_hash: this.props.whoami.entry.address,
        timestamp_created: moment().unix(),
        hierarchy: 'NoHierarchy',
        status: 'Uncertain',
        description: '',
      },
      this.props.parentAddress
    )
  }

  updateGoal() {
    this.props.updateGoal(
      {
        content: this.props.content,
        user_hash: this.props.whoami.entry.address,
        timestamp_created: this.props.timestamp_created,
        timestamp_updated: moment().unix(),
        hierarchy: this.props.hierarchy,
        status: this.props.status,
        time_frame: this.props.time_frame,
        description: this.props.description,
      },
      this.props.editAddress
    )
  }

  /*
    RENDER FUNCTION
  */
  render() {
    // Contained within the `render` function of a React component
    // is the strict definition of what HTML should appear on screen
    // depending on the data that is given to the component

    const { projectId, editAddress, content, xLoc, yLoc } = this.props

    // use the xLoc and yLoc to position the form anywhere on the screen
    // using a position relative to its container

    // optionally render the form dependent on whether the `isOpen` prop
    // is true, else render nothing
    return (
      <>
        <div
          className='goal_form_wrapper'
          style={{ position: 'absolute', top: `${yLoc}px`, left: `${xLoc}px` }}>
          <form className={'goal_form'} onSubmit={this.handleSubmit}>
            <TextareaAutosize
              placeholder='Add a title...'
              value={content}
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
              autoFocus
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
            />
          </form>
        </div>
        <div
          style={{
            position: 'absolute',
            top: `${yLoc}px`,
            left: `${xLoc + goalWidth}px`,
          }}>
          {editAddress && <VerticalActionsList projectId={projectId} />}
        </div>
      </>
    )
  }
}

// Setting propTypes helps us keep track of which properties
// a custom component that we define expects to be passed,
// and helps us to understand it more quickly as a developer
// looking at the code after it was written
GoalForm.propTypes = {
  parentAddress: PropTypes.string, // optional
  editAddress: PropTypes.string, // optional
  status: PropTypes.string,
  content: PropTypes.string.isRequired,
  xLoc: PropTypes.number.isRequired,
  yLoc: PropTypes.number.isRequired,
  createGoalWithEdge: PropTypes.func.isRequired,
  updateGoal: PropTypes.func.isRequired,
  closeGoalForm: PropTypes.func.isRequired,
}

// https://react-redux.js.org/using-react-redux/connect-mapstate
// Designed to grab selective data off of a redux state tree in order
// to pass it to a component for rendering, as specific properties that
// that component expects
function mapStateToProps(state) {
  // all the state for this component is store under state->ui->goalForm
  const { parentAddress, editAddress, content, xLoc, yLoc } = state.ui.goalForm
  const {
    ui: {
      activeProject,
      screensize: { width },
    },
  } = state
  let goalCoord
  if (editAddress) {
    goalCoord = layoutFormula(width, state)[editAddress]
  }
  // the name of the expected proptypes is the same
  // as the name of the properties as stored in state
  return {
    whoami: state.whoami,
    editAddress,
    parentAddress,
    content,
    status: editAddress
      ? state.projects.goals[activeProject][editAddress].status
      : 'Uncertain',
    description: editAddress
      ? state.projects.goals[activeProject][editAddress].description
      : '',
    hierarchy: editAddress
      ? state.projects.goals[activeProject][editAddress].hierarchy
      : 'NoHierarchy',
    time_frame: editAddress
      ? state.projects.goals[activeProject][editAddress].time_frame
      : null,
    timestamp_created: editAddress
      ? state.projects.goals[activeProject][editAddress].timestamp_created
      : null,
    xLoc: editAddress ? goalCoord.x : xLoc,
    yLoc: editAddress ? goalCoord.y : yLoc,
  }
}

// https://react-redux.js.org/using-react-redux/connect-mapdispatch
// Designed to pass functions into components which are already wrapped as
// action dispatchers for redux action types
function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    updateContent: content => {
      dispatch(updateContent(content))
    },
    createGoalWithEdge: (entry, maybe_parent_address) => {
      return dispatch(
        createGoalWithEdge.create({
          cellIdString,
          payload: { entry, maybe_parent_address },
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

// the `connect` function wraps the basic component into a component
// that receives the appropriate `props`.
export default connect(mapStateToProps, mapDispatchToProps)(GoalForm)
