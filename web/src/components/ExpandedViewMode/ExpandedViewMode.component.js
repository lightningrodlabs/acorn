import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { CSSTransition } from 'react-transition-group'
import './ExpandedViewMode.scss'
import { pickColorForString } from '../../styles'
import Icon from '../Icon/Icon'
import DatePicker from '../DatePicker/DatePicker'
import RightMenu from './RightMenu/RightMenu'
import ExpandedViewModeHeader from './ExpandedViewModeHeader/ExpandedViewModeHeader'
import ExpandedViewModeContent from './ExpandedViewModeContent/ExpandedViewModeContent'
import ExpandedViewModeFooter from './ExpandedViewModeFooter/ExpandedViewModeFooter'

export default function ExpandedViewMode({
  projectId,
  agentAddress,
  outcomeAddress,
  outcome,
  updateOutcome,
  onClose,
  creator,
  squirrels,
  comments,
  deleteOutcomeMember,
  createEntryPoint,
  deleteEntryPoint,
  isEntryPoint,
  entryPointAddress,
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
  editingPeers,
}) {
  const [outcomeState, setOutcomeState] = useState()
  const [squirrelsState, setSquirrelsState] = useState()
  const [creatorState, setCreatorState] = useState()
  const [showing, setShowing] = useState(false)
  const [editTimeframe, setEditTimeframe] = useState(false)

  useEffect(() => {
    if (showing && !outcomeAddress) {
      setShowing(false)
    } else if (!showing && outcomeAddress) {
      setShowing(true)
    }
  }, [outcomeAddress])

  useEffect(() => {
    if (outcome) {
      setOutcomeState({ ...outcome })
    }
  }, [outcome])

  useEffect(() => {
    if (squirrels) {
      setSquirrelsState([...squirrels])
    }
  }, [squirrels])

  useEffect(() => {
    if (creator) {
      setCreatorState({ ...creator })
    }
  }, [creator])

  const turnIntoEntryPoint = () => {
    createEntryPoint({
      color: pickColorForString(outcomeAddress),
      creator_address: agentAddress,
      created_at: Date.now(),
      outcome_address: outcomeAddress,
      is_imported: false
    })
  }
  const unmakeAsEntryPoint = () => {
    deleteEntryPoint(entryPointAddress)
  }
  const entryPointClickAction = isEntryPoint
    ? unmakeAsEntryPoint
    : turnIntoEntryPoint

  const updateTimeframe = (start, end) => {
    let timeframe = null

    if (start && end) {
      timeframe = {
        from_date: start,
        to_date: end,
      }
    }

    updateOutcome(
      {
        ...outcome,
        user_edit_hash: agentAddress,
        timestamp_updated: moment().unix(),
        time_frame: timeframe,
      },
      outcomeAddress
    )
  }

  let fromDate, toDate
  if (outcome) {
    fromDate = outcome.time_frame
      ? moment.unix(outcome.time_frame.from_date)
      : null
    toDate = outcome.time_frame ? moment.unix(outcome.time_frame.to_date) : null
  }

  return (
    <>
      <CSSTransition
        in={showing}
        timeout={100}
        unmountOnExit
        classNames='expanded-view-overlay'>
        <div className='expanded-view-overlay' />
      </CSSTransition>
      {outcomeState && (
        <CSSTransition
          in={showing}
          timeout={100}
          unmountOnExit
          classNames='expanded-view-wrapper'>
          <div className={`expanded-view-wrapper border_${outcomeState.status}`}>
            <Icon
              onClick={onClose}
              name='x.svg'
              size='small-close'
              className='light-grey'
            />
            <ExpandedViewModeHeader
              agentAddress={agentAddress}
              outcomeAddress={outcomeAddress}
              outcome={outcomeState}
              updateOutcome={updateOutcome}
              entryPointClickAction={entryPointClickAction}
              isEntryPoint={isEntryPoint}
            />
            <div className='expanded-view-main'>
              <ExpandedViewModeContent
                agentAddress={agentAddress}
                projectId={projectId}
                editTimeframe={editTimeframe}
                setEditTimeframe={setEditTimeframe}
                squirrels={squirrelsState}
                comments={comments}
                outcomeAddress={outcomeAddress}
                updateOutcome={updateOutcome}
                outcome={outcomeState}
                outcomeContent={outcomeState.content}
                outcomeDescription={outcomeState.description}
                deleteOutcomeMember={deleteOutcomeMember}
                startTitleEdit={startTitleEdit}
                endTitleEdit={endTitleEdit}
                startDescriptionEdit={startDescriptionEdit}
                endDescriptionEdit={endDescriptionEdit}
                editingPeers={editingPeers}
              />
              <RightMenu
                projectId={projectId}
                agentAddress={agentAddress}
                outcomeAddress={outcomeAddress}
                outcome={outcomeState}
                updateOutcome={updateOutcome}
              />
            </div>
            <ExpandedViewModeFooter outcome={outcomeState} creator={creatorState} />
            {editTimeframe && (
              <DatePicker
                onClose={() => setEditTimeframe(false)}
                onSet={updateTimeframe}
                fromDate={fromDate}
                toDate={toDate}
              />
            )}
          </div>
        </CSSTransition >
      )
      }
    </>
  )
}
