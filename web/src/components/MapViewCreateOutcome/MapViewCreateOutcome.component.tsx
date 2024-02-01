import React, { useEffect, useRef, useState } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import TextareaAutosize from 'react-textarea-autosize'
import moment from 'moment'

import './MapViewCreateOutcome.scss'
import {
  AgentPubKeyB64,
  CellIdString,
  ActionHashB64,
  Option,
} from '../../types/shared'
import { LinkedOutcomeDetails, Outcome } from '../../types'
import ButtonCheckbox from '../ButtonCheckbox/ButtonCheckbox'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import Icon from '../Icon/Icon'
import checkForKeyboardKeyModifier from '../../event-listeners/helpers/osPlatformHelper'
import useContainWithinScreen from '../../hooks/useContainWithinScreen'
import { AppAgentClient } from '@holochain/client'

export type MapViewCreateOutcomeOwnProps = {
  projectId: CellIdString
  appWebsocket: AppAgentClient
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
  // outer ref for the sake of onClickOutside
  const outerRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  useOnClickOutside(outerRef, handleSubmit)

  const [isSmallScopeChecked, setIsSmallScopeChecked] = useState(false)
  const [textIsFocused, setTextIsFocused] = useState(false)

  /* EVENT HANDLERS */
  // when the text value changes
  const handleChange = (event) => {
    updateContent(event.target.value)
  }

  // keyboard listener
  useEffect(() => {
    // since Enter will be used to toggle the checkbox
    // when that is focused, we can submit on pure Enter for the textbox
    // but they must use Command/Ctrl-Enter to submit when the button/checkbox
    // is focused
    const handleKeyDown = (e: KeyboardEvent) => {
      if (textIsFocused && e.key === 'Enter') {
        handleSubmit()
      } else if (
        !textIsFocused &&
        e.key === 'Enter' &&
        checkForKeyboardKeyModifier(e)
      ) {
        handleSubmit()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    textIsFocused,
    content,
    activeAgentPubKey,
    isSmallScopeChecked,
    existingParentConnectionAddress,
  ])

  // when the input comes into focus
  const handleFocus = (event) => {
    // select the text
    event.target.select()
    setTextIsFocused(true)
  }
  const handleBlur = () => {
    setTextIsFocused(false)
  }

  // this can get called via keyboard events
  // or via 'onClickOutside' of the MapViewCreateOutcome component
  async function handleSubmit() {
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

  const pageCoords = coordsCanvasToPage(
    {
      x: leftConnectionXPosition,
      y: topConnectionYPosition,
    },
    translate,
    scale
  )
  // set card width in pixels
  const cardWidth = 384
  // use this hook to make sure the card is contained within the screen
  const {
    initialized,
    setItemHeight: setCardHeight,
    renderCoordinate,
  } = useContainWithinScreen({
    initialWidth: cardWidth,
    initialHeight: 0,
    cursorCoordinate: pageCoords,
  })

  // capture card's height as rendered on the screen
  useEffect(() => {
    if (outerRef.current) {
      const height = outerRef.current.offsetHeight
      setCardHeight(height)
    }
    // this also fires when the `content` changes
    // so that adjustments can be made to the height
  }, [outerRef.current, content])

  // focus text area
  // after the whole thing becomes visible
  // which is after the height is calculated
  // this is necessary because a non visible
  // element cannot be focused
  useEffect(() => {
    if (initialized) {
      textAreaRef.current?.focus()
    }
  }, [initialized])

  return (
    <div
      className="map-view-create-outcome-statement-card"
      style={{
        left: `${renderCoordinate.x}px`,
        top: `${renderCoordinate.y}px`,
        visibility: initialized ? 'visible' : 'hidden',
      }}
      // ref for the sake of onClickOutside
      ref={outerRef}
    >
      <div className="create-outcome-statement-form">
        <TextareaAutosize
          autoFocus
          placeholder="Add an Outcome Statement"
          value={content}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          ref={textAreaRef}
        />
      </div>
      {/* small scope option checkbox */}
      <div className="create-outcome-statement-checkbox">
        <ButtonCheckbox
          size={'small'}
          isChecked={isSmallScopeChecked}
          onChange={(newState) => setIsSmallScopeChecked(newState)}
          icon={<Icon name="leaf.svg" className="not-hoverable" />}
          text={'Small Scope'}
        />
      </div>
    </div>
  )
}

export default MapViewCreateOutcome
