import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { CSSTransition } from 'react-transition-group'
import './ExpandedViewMode.scss'
import { pickColorForString } from '../../styles'
import Icon from '../Icon/Icon'
import DatePicker from '../DatePicker/DatePicker'
import RightMenu from './EVRightColumn/EVRightColumn'
import ExpandedViewModeHeader from './ExpandedViewModeHeader/ExpandedViewModeHeader'
import EVMiddleColumn from './EVMiddleColumn/EVMiddleColumn'
import ExpandedViewModeFooter from './ExpandedViewModeFooter/ExpandedViewModeFooter'
import EVLeftColumn from './EVLeftColumn/EVLeftColumn'
import EVRightColumn from './EVRightColumn/EVRightColumn'
import { ExpandedViewTab } from './NavEnum'

export default function ExpandedViewMode({
  projectId,
  agentAddress,
  outcomeHeaderHash,
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
    if (showing && !outcomeHeaderHash) {
      setShowing(false)
    } else if (!showing && outcomeHeaderHash) {
      setShowing(true)
    }
  }, [outcomeHeaderHash])

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
      color: pickColorForString(outcomeHeaderHash),
      creatorAgentPubKey: agentAddress,
      createdAt: Date.now(),
      outcomeHeaderHash: outcomeHeaderHash,
      isImported: false,
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
        fromDate: start,
        toDate: end,
      }
    }

    updateOutcome(
      {
        ...outcome,
        editorAgentPubKey: agentAddress,
        timestampUpdated: moment().unix(),
        timeFrame: timeframe,
      },
      outcomeHeaderHash
    )
  }

  let fromDate, toDate
  if (outcome) {
    fromDate = outcome.timeFrame
      ? moment.unix(outcome.timeFrame.fromDate)
      : null
    toDate = outcome.timeFrame ? moment.unix(outcome.timeFrame.toDate) : null
  }
  const [activeTab, setActiveTab] = useState(ExpandedViewTab.Details)
  
  return (
    <>
      <CSSTransition
        in={showing}
        timeout={100}
        unmountOnExit
        classNames="expanded-view-overlay"
      >
        <div className="expanded-view-overlay" />
      </CSSTransition>
      {outcomeState && (
        <CSSTransition
          in={showing}
          timeout={100}
          unmountOnExit
          classNames="expanded-view-wrapper"
        >
          {/* <div className={`expanded-view-wrapper border_${outcomeState.status}`}>
            <Icon
              onClick={onClose}
              name='x.svg'
              size='small-close'
              className='light-grey'
            />
            <ExpandedViewModeHeader
              agentAddress={agentAddress}
              outcomeHeaderHash={outcomeHeaderHash}
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
                outcomeHeaderHash={outcomeHeaderHash}
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
                outcomeHeaderHash={outcomeHeaderHash}
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
          </div> */}
          <div className="expanded-view-wrapper">
            <EVLeftColumn
              activeTab={activeTab}
              onChange={(newTab) => setActiveTab(newTab)}
              commentCount={comments.length}
            />
            <EVMiddleColumn
              agentAddress={agentAddress}
              projectId={projectId}
              editTimeframe={editTimeframe}
              setEditTimeframe={setEditTimeframe}
              squirrels={squirrelsState}
              comments={comments}
              outcomeHeaderHash={outcomeHeaderHash}
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
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <EVRightColumn
              projectId={projectId}
              agentAddress={agentAddress}
              outcomeHeaderHash={outcomeHeaderHash}
              outcome={outcomeState}
              updateOutcome={updateOutcome}
            />
          </div>
        </CSSTransition>
      )}
    </>
  )
}
