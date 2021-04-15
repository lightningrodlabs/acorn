import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { CSSTransition } from 'react-transition-group'

import './ExpandedViewMode.css'
import {
  createEntryPoint,
  archiveEntryPoint,
} from '../../projects/entry-points/actions'
import { updateGoal } from '../../projects/goals/actions'
import { archiveGoalMember } from '../../projects/goal-members/actions'

import { pickColorForString } from '../../styles'
import Icon from '../Icon/Icon'
import DatePicker from '../DatePicker/DatePicker'
import RightMenu from './RightMenu/RightMenu'
import ExpandedViewModeHeader from './ExpandedViewModeHeader/ExpandedViewModeHeader'
import ExpandedViewModeContent from './ExpandedViewModeContent/ExpandedViewModeContent'
import ExpandedViewModeFooter from './ExpandedViewModeFooter/ExpandedViewModeFooter'


function ExpandedViewMode({
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
              name='x-bold.svg'
              size='small-close'
              className='grey'
            />
            <ExpandedViewModeHeader
              goalAddress={goalAddress}
              goal={goalState}
              updateGoal={updateGoal}
              entryPointClickAction={entryPointClickAction}
              isEntryPoint={isEntryPoint}
            />
            <div className='expanded-view-main'>
              <ExpandedViewModeContent
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
              />
              <RightMenu
                projectId={projectId}
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

function mapStateToProps(state, ownProps) {
  let goal,
    creator = null,
    squirrels = [],
    comments = []

  const { projectId } = ownProps
  const goals = state.projects.goals[projectId] || {}
  const goalMembers = state.projects.goalMembers[projectId] || {}
  const entryPoints = state.projects.entryPoints[projectId] || {}
  const goalComments = state.projects.goalComments[projectId] || {}

  if (state.ui.expandedView.goalAddress) {
    goal = goals[state.ui.expandedView.goalAddress]
    comments = Object.values(goalComments).filter(
      goalComment => goalComment.goal_address === state.ui.expandedView.goalAddress
    )
    squirrels = Object.keys(goalMembers)
      .map(address => goalMembers[address])
      .filter(goalMember => goalMember.goal_address === goal.address)
      .map(goalMember => {
        const squirrel = {
          ...state.agents[goalMember.agent_address],
          goalMemberAddress: goalMember.address
        }
        return squirrel
      })
    Object.keys(state.agents).forEach(value => {
      if (state.agents[value].address === goal.user_hash)
        creator = state.agents[value]
    })
  }

  const goalAddress = state.ui.expandedView.goalAddress
  const entryPoint = Object.values(entryPoints).find(
    entryPoint => entryPoint.goal_address === goalAddress
  )
  const isEntryPoint = entryPoint ? true : false
  const entryPointAddress = entryPoint ? entryPoint.address : null

  return {
    agentAddress: state.agentAddress,
    isEntryPoint,
    entryPointAddress,
    goalAddress,
    creator,
    goal,
    squirrels,
    comments
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    createEntryPoint: payload => {
      return dispatch(createEntryPoint.create({ cellIdString, payload }))
    },
    archiveEntryPoint: payload => {
      return dispatch(archiveEntryPoint.create({ cellIdString, payload }))
    },
    updateGoal: (entry, address) => {
      return dispatch(
        updateGoal.create({ cellIdString, payload: { address, entry } })
      )
    },
    archiveGoalMember: payload => {
      return dispatch(archiveGoalMember.create({ cellIdString, payload }))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpandedViewMode)
