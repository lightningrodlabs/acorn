import React, { useRef } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import TextareaAutosize from 'react-textarea-autosize'
import moment from 'moment'

import {
  firstZoomThreshold,
  fontSize,
  fontSizeExtraLarge,
  fontSizeLarge,
  lineHeightMultiplier,
  secondZoomThreshold,
} from '../../drawing/dimensions'
import './MapViewOutcomeTitleForm.scss'

// if editAddress is present (as a Outcome address) it means we are currently EDITING that Outcome
export default function MapViewOutcomeTitleForm({
  presentToUser,
  activeAgentPubKey,
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
  // coordinates in css terms for the box
  leftConnectionXPosition,
  topConnectionYPosition,
  // callbacks
  updateContent,
  deleteConnection,
  createOutcomeWithConnection,
  closeOutcomeForm,
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
    // if creating a outcome
    event.preventDefault()
    handleSubmit()
  }

  // this can get called via keyboard events
  // or via 'onClickOutside' of the MapViewOutcomeTitleForm component
  const handleSubmit = async (event?) => {
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
      await innerCreateOutcomeWithConnection()
    }

    const isKeyboardTrigger = !event
    // don't close this if it was a click on the vertical-actions-list
    // that caused this 'onClickOutside' event
    const verticalActionsList = document.querySelector('.vertical-actions-list')
    const clickNotOnActionsList =
      event &&
      verticalActionsList &&
      !verticalActionsList.contains(event.target)
    // close it for sure, if this is a Create action (and not an update action)
    if (isKeyboardTrigger || clickNotOnActionsList) {
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
        content,
        creatorAgentPubKey: activeAgentPubKey,
        timestampCreated: moment().unix(),
        // defaults
        editorAgentPubKey: null,
        scope: { Uncertain: 0 },
        description: '',
        isImported: false,
      },
      fromAddress ? { outcomeHeaderHash: fromAddress, relation } : null
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
    lineHeight: `${parseInt(fontSizeToUse) * lineHeightMultiplier}px`,
  }

  const ref = useRef()
  useOnClickOutside(ref, handleSubmit)

  return (
    <div
      className="map-view-outcome-title-form-wrapper"
      style={{
        top: `${topConnectionYPosition}px`,
        left: `${leftConnectionXPosition}px`,
      }}
      // ref for the sake of onClickOutside
      ref={ref}
    >
      {presentToUser && (
        <form
          className="map-view-outcome-title-form-form"
          onSubmit={handleSubmit}
        >
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
      )}
    </div>
  )
}
