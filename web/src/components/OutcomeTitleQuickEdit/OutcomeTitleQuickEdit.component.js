import React, { useRef } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import TextareaAutosize from 'react-textarea-autosize'
import moment from 'moment'
import './OutcomeTitleQuickEdit.scss'
import { firstZoomThreshold, fontSize, fontSizeExtraLarge, fontSizeLarge, lineHeightMultiplier, secondZoomThreshold } from '../../drawing/dimensions'

// if editAddress is present (as a Outcome address) it means we are currently EDITING that Outcome
export default function OutcomeTitleQuickEdit({
  presentToUser,
  whoami,
  scale,
  // the value of the text input
  content,
  // (optional) the address of a Outcome to connect this Outcome to
  // in the case of creating a Outcome
  fromAddress,
  // (optional) the relation (relation_as_{child|parent}) between the two
  // in the case of creating a Outcome
  relation,
  // (optional) the address of an existing connection that
  // indicates this Outcome as the child of another (a.k.a has a parent)
  // ASSUMPTION: one parent
  existingParentConnectionAddress,
  editAddress,
  // coordinates in css terms for the box
  leftConnectionXPosition,
  topConnectionYPosition,
  // existing or default properties of the outcome
  status,
  description,
  hierarchy,
  timeFrame,
  timestampCreated,
  isImported,
  userHash, // creator
  userEditHash, // editor
  // callbacks
  updateContent,
  deleteConnection,
  createOutcomeWithConnection,
  updateOutcome,
  closeOutcomeForm,
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
    // only send an edit signal if editing a outcome, not creating one
    if (editAddress) {
      startTitleEdit(editAddress)
    }
  }
  // when the input leaves focus (not focused on editing title)
  const handleBlur = (event) => {
    // if creating a outcome (not editing it)
    if (!editAddress) {
      event.preventDefault()
      handleSubmit()
    }
  }

  // this can get called via keyboard events
  // or via 'onClickOutside' of the OutcomeTitleQuickEdit component
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
      closeOutcomeForm()
      return
    }

    // depending on editAddress, this
    // might be an update to an existing...
    // otherwise it's a new Outcome being created
    if (presentToUser) {
      if (editAddress) {
        await innerUpdateOutcome()
      } else {
        await innerCreateOutcomeWithConnection()
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
      closeOutcomeForm()
    }
  }

  const innerCreateOutcomeWithConnection = async () => {
    // if we are replacing an connection with this one
    // delete the existing connection first
    // ASSUMPTION: one parent
    if (existingParentConnectionAddress) {
      await deleteConnection(existingParentConnectionAddress)
    }

    // dispatch the action to create a outcome
    // with the contents from the form
    // inserted into it
    await createOutcomeWithConnection(
      {
        content: content,
        timestampCreated: moment().unix(),
        // defaults
        userEditHash,
        userHash,
        hierarchy,
        status,
        description,
        isImported,
      },
      fromAddress ? { outcomeAddress: fromAddress, relation } : null
    )
  }

  const innerUpdateOutcome = async () => {
    await updateOutcome(
      {
        // new
        userEditHash: whoami.entry.address,
        description: description,
        timestampUpdated: moment().unix(),
        // carryover
        content,
        userHash,
        timestampCreated,
        hierarchy,
        status,
        timeFrame,
        isImported,
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
      className="outcome-title-quick-edit-wrapper"
      style={{
        top: `${topConnectionYPosition}px`,
        left: `${leftConnectionXPosition}px`,
      }}
      // ref for the sake of onClickOutside
      ref={ref}
    >
      {presentToUser && <form className="outcome-title-quick-edit-form" onSubmit={handleSubmit}>
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
