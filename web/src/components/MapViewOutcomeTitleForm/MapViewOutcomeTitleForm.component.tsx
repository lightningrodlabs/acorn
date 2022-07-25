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
import {
  AgentPubKeyB64,
  CellIdString,
  ActionHashB64,
  Option,
} from '../../types/shared'
import { LinkedOutcomeDetails, Outcome, RelationInput } from '../../types'

export type MapViewOutcomeTitleFormOwnProps = {
  projectId: CellIdString
}

export type MapViewOutcomeTitleFormConnectorStateProps = {
  activeAgentPubKey: AgentPubKeyB64
  scale
  // the value of the text input
  content: string
  // coordinates in css terms for the box
  leftConnectionXPosition: number
  topConnectionYPosition: number
  // (optional) the address of an Outcome to connect this Outcome to
  // in the case of creating an Outcome
  fromAddress: ActionHashB64
  // (optional) the relation (relation_as_{child|parent}) between the two
  // in the case of creating an Outcome
  relation: RelationInput
  // (optional) the address of an existing connection that
  // indicates this Outcome as the child of another (a.k.a has a parent)
  // ASSUMPTION: one parent
  existingParentConnectionAddress: ActionHashB64
}

export type MapViewOutcomeTitleFormConnectorDispatchProps = {
  // callbacks
  updateContent: (content: string) => void
  deleteConnection: (actionHash: ActionHashB64) => Promise<void>
  createOutcomeWithConnection: (
    entry: Outcome,
    maybeLinkedOutcome: Option<LinkedOutcomeDetails>
  ) => Promise<void>
  closeOutcomeForm: () => void
}

export type MapViewOutcomeTitleFormProps = MapViewOutcomeTitleFormOwnProps &
  MapViewOutcomeTitleFormConnectorStateProps &
  MapViewOutcomeTitleFormConnectorDispatchProps

const MapViewOutcomeTitleForm: React.FC<MapViewOutcomeTitleFormProps> = ({
  activeAgentPubKey,
  scale,
  content,
  fromAddress,
  relation,
  existingParentConnectionAddress,
  leftConnectionXPosition,
  topConnectionYPosition,
  updateContent,
  deleteConnection,
  createOutcomeWithConnection,
  closeOutcomeForm,
}) => {
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
    // if creating an Outcome
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

    // create the new Outcome (and maybe Connection)
    await innerCreateOutcomeWithConnection()
    // reset the textarea value to empty
    updateContent('')
    closeOutcomeForm()
  }

  const innerCreateOutcomeWithConnection = async () => {
    // if we are replacing an connection with this one
    // delete the existing connection first
    // ASSUMPTION: one parent
    if (existingParentConnectionAddress) {
      await deleteConnection(existingParentConnectionAddress)
    }

    // dispatch the action to create an Outcome
    // with the contents from the form
    // inserted into it
    await createOutcomeWithConnection(
      {
        content,
        creatorAgentPubKey: activeAgentPubKey,
        timestampCreated: moment().unix(),
        // defaults
        timestampUpdated: null,
        editorAgentPubKey: null,
        scope: {
          Uncertain: { smallsEstimate: 0, timeFrame: null, inBreakdown: false },
        },
        tags: [],
        description: '',
        isImported: false,
        githubLink: '',
      },
      fromAddress ? { outcomeActionHash: fromAddress, relation } : null
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
      <form
        className="map-view-outcome-title-form-form"
        onSubmit={handleSubmit}
      >
        <TextareaAutosize
          autoFocus
          placeholder="Add an Outcome Statement"
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

export default MapViewOutcomeTitleForm
