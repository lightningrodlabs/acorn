import React, { useRef, useState } from 'react'
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
import './MapViewCreateOutcome.scss'
import {
  AgentPubKeyB64,
  CellIdString,
  ActionHashB64,
  Option,
} from '../../types/shared'
import { LinkedOutcomeDetails, Outcome, RelationInput } from '../../types'
import Checkbox from '../Checkbox/Checkbox'
import ButtonCheckbox from '../ButtonCheckbox/ButtonCheckbox'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import Icon from '../Icon/Icon'

export type MapViewCreateOutcomeOwnProps = {
  projectId: CellIdString
}

export type MapViewCreateOutcomeConnectorStateProps = {
  activeAgentPubKey: AgentPubKeyB64
  scale: number
  translate: {
    x: number
    y: number
  }
  // the value of the text input
  content: string
  // coordinates in css terms for the box
  leftConnectionXPosition: number
  topConnectionYPosition: number
  maybeLinkedOutcome: Option<LinkedOutcomeDetails>
  // (optional) the address of an existing connection that
  // indicates this Outcome as the child of another (a.k.a has a parent)
  existingParentConnectionAddress: ActionHashB64
}

export type MapViewCreateOutcomeConnectorDispatchProps = {
  // callbacks
  updateContent: (content: string) => void
  deleteConnection: (actionHash: ActionHashB64) => Promise<void>
  createOutcomeWithConnection: (
    entry: Outcome,
    maybeLinkedOutcome: Option<LinkedOutcomeDetails>
  ) => Promise<void>
  closeOutcomeForm: () => void
}

export type MapViewCreateOutcomeProps = MapViewCreateOutcomeOwnProps &
  MapViewCreateOutcomeConnectorStateProps &
  MapViewCreateOutcomeConnectorDispatchProps

const MapViewCreateOutcome: React.FC<MapViewCreateOutcomeProps> = ({
  activeAgentPubKey,
  scale,
  translate,
  content,
  maybeLinkedOutcome,
  existingParentConnectionAddress,
  leftConnectionXPosition,
  topConnectionYPosition,
  updateContent,
  deleteConnection,
  createOutcomeWithConnection,
  closeOutcomeForm,
}) => {
  const [isSmallScopeChecked, setIsSmallScopeChecked] = useState(false)

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
    // handleSubmit()
  }

  // this can get called via keyboard events
  // or via 'onClickOutside' of the MapViewCreateOutcome component
  const handleSubmit = async (event?) => {
    console.log('here')
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
        scope: isSmallScopeChecked
          ? {
              Small: {
                achievementStatus: 'NotAchieved',
                targetDate: null,
                taskList: [],
              },
            }
          : {
              Uncertain: {
                smallsEstimate: 0,
                timeFrame: null,
                inBreakdown: false,
              },
            },
        tags: [],
        description: '',
        isImported: false,
        githubLink: '',
      },
      // could be null and that's ok
      maybeLinkedOutcome
    )
  }

  // the default
  let fontSizeToUse = fontSize
  if (scale < secondZoomThreshold) {
    fontSizeToUse = fontSizeExtraLarge
  } else if (scale < firstZoomThreshold) {
    fontSizeToUse = fontSizeLarge
  }
  // const textStyle = {
  //   fontSize: fontSize,
  //   lineHeight: `${parseInt(fontSizeToUse) * lineHeightMultiplier}px`,
  // }

  const ref = useRef()
  useOnClickOutside(ref, handleSubmit)

  const pageCoords = coordsCanvasToPage(
    {
      x: leftConnectionXPosition,
      y: topConnectionYPosition,
    },
    translate,
    scale
  )

  return (
    <div
      className="map-view-outcome-statement-card"
      style={{
        left: `${pageCoords.x}px`,
        top: `${pageCoords.y}px`,
      }}
      // ref for the sake of onClickOutside
      ref={ref}
    >
      <form className="map-view-outcome-statement-form" onSubmit={handleSubmit}>
        <TextareaAutosize
          autoFocus
          placeholder="Add an Outcome Statement"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          // style={textStyle}
        />

        {/* <Checkbox size={'small'} />
       This Outcome is Small Scope */}
      </form>
      {/* small scope option checkbox */}
      <div className="map-view-outcome-statement-checkbox">
        <ButtonCheckbox
          size={'small'}
          isChecked={isSmallScopeChecked}
          onChange={(newState) => setIsSmallScopeChecked(newState)}
          icon={<Icon name="leaf.svg" className="not-hoverable" />}
          text={'This Outcome is Small Scope'}
        />
      </div>
    </div>
  )
}

export default MapViewCreateOutcome
