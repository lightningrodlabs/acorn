import React, { useRef } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import TextareaAutosize from 'react-textarea-autosize'
import moment from 'moment'
import './GoalTitleQuickEdit.scss'
import { firstZoomThreshold, fontSize, fontSizeExtraLarge, fontSizeLarge, lineHeightMultiplier, secondZoomThreshold } from '../../drawing/dimensions'

// if editAddress is present (as a Goal address) it means we are currently EDITING that Goal
export default function GoalTitleQuickEdit({
  presentToUser,
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
  // (optional) the address of an existing edge that
  // indicates this Goal as the child of another (a.k.a has a parent)
  // ASSUMPTION: one parent
  existingParentEdgeAddress,
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
  archiveEdge,
  createGoalWithEdge,
  updateGoal,
  closeGoalForm,
  startTitleEdit,
  endTitleEdit,
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
    // only send an edit signal if editing a goal, not creating one
    if (editAddress) {
      startTitleEdit(editAddress)
    }
  }
  // when the input leaves focus (not focused on editing title)
  const handleBlur = (event) => {
    // if creating a goal (not editing it)
    if (!editAddress) {
      event.preventDefault()
      handleSubmit()
    }
  }

  // this can get called via keyboard events
  // or via 'onClickOutside' of the GoalTitleQuickEdit component
  const handleSubmit = async (event) => {
    console.log(event)
    if (event) {
      // this is to prevent the page from refreshing
      // when the form is submitted, which is the
      // default behaviour
      event.preventDefault()
    }

    // do not allow submit with no content
    if (!content || content === '') {
      closeGoalForm()
      return
    }

    // depending on editAddress, this
    // might be an update to an existing...
    // otherwise it's a new Goal being created
    if (presentToUser) {
      if (editAddress) {
        await innerUpdateGoal()
      } else {
        await innerCreateGoalWithEdge()
      }
    }

    const isKeyboardTrigger = !event
    // don't close this if it was a click on the vertical-actions-list
    // that caused this 'onClickOutside' event
    const verticalActionsList = document.querySelector('.vertical-actions-list')
    const clickNotOnActionsList = event && verticalActionsList && !verticalActionsList.contains(event.target)
    // close it for sure, if this is a Create action (and not an update action)
    if (isKeyboardTrigger || !editAddress || clickNotOnActionsList) {
      // reset the textarea value to empty
      updateContent('')
      closeGoalForm()
    }
  }

  const innerCreateGoalWithEdge = async () => {
    // if we are replacing an edge with this one
    // delete the existing edge first
    // ASSUMPTION: one parent
    if (existingParentEdgeAddress) {
      await archiveEdge(existingParentEdgeAddress)
    }

    // dispatch the action to create a goal
    // with the contents from the form
    // inserted into it
    await createGoalWithEdge(
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

  const innerUpdateGoal = async () => {
    await updateGoal(
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
    endTitleEdit(editAddress)
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

  const ref = useRef()
  useOnClickOutside(ref, handleSubmit)

  return (
    <div
      className="goal-title-quick-edit-wrapper"
      style={{
        top: `${topEdgeYPosition}px`,
        left: `${leftEdgeXPosition}px`,
      }}
      // ref for the sake of onClickOutside
      ref={ref}
    >
      {presentToUser && <form className="goal-title-quick-edit-form" onSubmit={handleSubmit}>
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
      </form>}
    </div>
  )
}
