import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { CSSTransition } from 'react-transition-group'
import './ExpandedViewMode.css'
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
  goalAddress,
  goal,
  updateGoal,
  onClose,
  creator,
  squirrels,
  comments,
  archiveGoalMember,
  createEntryPoint,
  archiveEntryPoint,
  isEntryPoint,
  entryPointAddress,
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
  editingPeers,
}) {
  const [goalState, setGoalState] = useState()
  const [squirrelsState, setSquirrelsState] = useState()
  const [creatorState, setCreatorState] = useState()
  const [showing, setShowing] = useState(false)
  const [editTimeframe, setEditTimeframe] = useState(false)

  useEffect(() => {
    if (showing && !goalAddress) {
      setShowing(false)
    } else if (!showing && goalAddress) {
      setShowing(true)
    }
  }, [goalAddress])

  useEffect(() => {
    if (goal) {
      setGoalState({ ...goal })
    }
  }, [goal])

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
      color: pickColorForString(goalAddress),
      creator_address: agentAddress,
      created_at: Date.now(),
      goal_address: goalAddress,
      is_imported: false
    })
  }
  const unmakeAsEntryPoint = () => {
    archiveEntryPoint(entryPointAddress)
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

    updateGoal(
      {
        ...goal,
        user_edit_hash: agentAddress,
        timestamp_updated: moment().unix(),
        time_frame: timeframe,
      },
      goalAddress
    )
  }

  let fromDate, toDate
  if (goal) {
    fromDate = goal.time_frame
      ? moment.unix(goal.time_frame.from_date)
      : null
    toDate = goal.time_frame ? moment.unix(goal.time_frame.to_date) : null
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
      {goalState && (
        <CSSTransition
          in={showing}
          timeout={100}
          unmountOnExit
          classNames='expanded-view-wrapper'>
          <div className={`expanded-view-wrapper border_${goalState.status}`}>
            <Icon
              onClick={onClose}
              name='x.svg'
              size='small-close'
              className='light-grey'
            />
            <ExpandedViewModeHeader
              agentAddress={agentAddress}
              goalAddress={goalAddress}
              goal={goalState}
              updateGoal={updateGoal}
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
                goalAddress={goalAddress}
                updateGoal={updateGoal}
                goal={goalState}
                goalContent={goalState.content}
                goalDescription={goalState.description}
                archiveGoalMember={archiveGoalMember}
                startTitleEdit={startTitleEdit}
                endTitleEdit={endTitleEdit}
                startDescriptionEdit={startDescriptionEdit}
                endDescriptionEdit={endDescriptionEdit}
                editingPeers={editingPeers}
              />
              <RightMenu
                projectId={projectId}
                agentAddress={agentAddress}
                goalAddress={goalAddress}
                goal={goalState}
                updateGoal={updateGoal}
              />
            </div>
            <ExpandedViewModeFooter goal={goalState} creator={creatorState} />
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
