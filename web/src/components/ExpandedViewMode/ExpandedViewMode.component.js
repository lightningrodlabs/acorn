import React, { useState, useEffect, useContext } from 'react'
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
import ComputedOutcomeContext from '../../context/ComputedOutcomeContext'

export default function ExpandedViewMode({
  projectId,
  agentAddress,
  outcomeHeaderHash,
  updateOutcome,
  onClose,
  squirrels,
  profiles,
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

  const { computedOutcomesKeyed } = useContext(ComputedOutcomeContext)
  const outcome = computedOutcomesKeyed[outcomeHeaderHash]
  // console.log(outcome && outcome.computedAchievementStatus.uncertains)

  let creator
  if (outcome) {
    Object.keys(profiles).forEach((value) => {
      if (profiles[value].agentPubKey === outcome.creatorAgentPubKey)
        creator = profiles[value]
    })
  }

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
  let uncertains, smallsAchieved, smallsTotal
  if (outcome) {
    fromDate = outcome.timeFrame
      ? moment.unix(outcome.timeFrame.fromDate)
      : null
    toDate = outcome.timeFrame ? moment.unix(outcome.timeFrame.toDate) : null

    uncertains = outcome.computedAchievementStatus.uncertains
    smallsAchieved = outcome.computedAchievementStatus.smallsAchieved
    smallsTotal = outcome.computedAchievementStatus.smallsTotal
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
          <div className="expanded-view-wrapper">
          <Icon
              onClick={onClose}
              name='x.svg'
              size='small-close'
              className='light-grey'
            />
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
              uncertains={uncertains}
              smallsAchieved={smallsAchieved}
              smallsTotal={smallsTotal}
            />
            <EVRightColumn
              projectId={projectId}
              agentAddress={agentAddress}
              outcomeHeaderHash={outcomeHeaderHash}
              outcome={outcomeState}
              updateOutcome={updateOutcome}
              isEntryPoint={isEntryPoint}
              entryPointClickAction={entryPointClickAction}
            />
          </div>
        </CSSTransition>
      )}
    </>
  )
}
