import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import { makeStyles } from '@material-ui/core/styles'
import Slider from '@material-ui/core/Slider'
import moment from 'moment'

import './PriorityPickerVote.css'
import {
  createGoalVote,
  archiveGoalVote,
  updateGoalVote,
} from '../../../projects/goal-votes/actions'
import Icon from '../../Icon/Icon'

const useStyles = makeStyles({
  root: {
    color: '#6600FF',
    height: 8,
    borderRadius: 10,
    border: 0,
    padding: '10px 0',
    margin: '14px 0 10px',
    width: '166px',
  },
  rail: {
    height: 5,
    borderRadius: 10,
    color: '#D9D9D9',
    opacity: 1,
  },
  mark: {
    height: 9,
    width: 1,
    borderRadius: 4,
    margin: '-2px 0 0 0px',
    color: '#A3A3A3',
    opacity: 1,
    backgroundColor: '#A3A3A3',
  },
  markActive: {
    height: 9,
    width: 1,
    borderRadius: 4,
    margin: '-2px 0 0 0px',
    color: '#A3A3A3',
    opacity: 1,
    backgroundColor: '#A3A3A3',
  },
  markLabel: {
    top: '-18px',
    position: 'absolute',
    fontSize: '12px',
    fontFamily: '"hk-grotesk-medium", "Helvetica", "Arial", "sans-serif"',
    lineHeight: '1',
    color: '#A3A3A3',
  },
  track: {
    height: 5,
    borderRadius: 10,
  },
  thumb: {
    height: 16,
    width: 16,
    border: '1.5px solid #FFFFFF',
    marginTop: -6,
    marginLeft: -6,
    boxShadow: '0 1.5px 3px 0 RGB(0, 0 , 0, 0.5)',
  },
  disabled: {
    color: '#6600FF',
  },
})

const marksWithLabels = [
  {
    value: 0,
    label: 'low',
  },
  {
    value: 25,
    label: '',
  },
  {
    value: 50,
    label: '',
  },
  {
    value: 75,
    label: '',
  },
  {
    value: 100,
    label: 'high',
  },
]

const marksWithoutLabels = [
  {
    value: 0,
    label: '',
  },
  {
    value: 25,
    label: '',
  },
  {
    value: 50,
    label: '',
  },
  {
    value: 75,
    label: '',
  },
  {
    value: 100,
    label: '',
  },
]
function valuetext(value) {
  return `${value}%`
}

const priorityItems = [
  { icon: 'urgency.svg', title: 'Urgency' },
  { icon: 'importance.svg', title: 'Importance' },
  { icon: 'impact.svg', title: 'Impact' },
  { icon: 'effort.png', title: 'Effort' },
]

function PrioritySlider({
  icon,
  title,
  withLabels,
  value,
  disabled = false,
  onChange = () => { },
  onChangeCommitted = () => { },
}) {
  const classes = useStyles()
  return (
    <div className='priority-item'>
      <Icon
        className='priority-item-icon not-hoverable grey'
        name={icon}
        size='very-small'
      />
      <div className='priority-item-title'>{title}</div>
      <Slider
        onChange={onChange}
        onChangeCommitted={onChangeCommitted}
        defaultValue={50}
        value={value}
        getAriaValueText={valuetext}
        aria-labelledby='discrete-slider-custom'
        step={25}
        valueLabelDisplay='auto'
        marks={withLabels ? marksWithLabels : marksWithoutLabels}
        disabled={disabled}
        classes={{
          root: classes.root, // class name, e.g. `classes-nesting-root-x`
          label: classes.label, // class name, e.g. `classes-nesting-label-x`
          rail: classes.rail,
          mark: classes.mark,
          markLabel: classes.markLabel,
          offset: classes.offset,
          track: classes.track,
          thumb: classes.thumb,
          disabled: classes.disabled,
        }}
      />
    </div>
  )
}

function Aggregated({ votes }) {
  let averageValues = [0, 0, 0, 0]
  if (votes.length > 0) {
    votes.forEach(element => {
      averageValues[0] += element.urgency * 100
      averageValues[1] += element.importance * 100
      averageValues[2] += element.impact * 100
      averageValues[3] += element.effort * 100
    })
    averageValues[0] /= votes.length
    averageValues[1] /= votes.length
    averageValues[2] /= votes.length
    averageValues[3] /= votes.length
  } else {
    averageValues = [50, 50, 50, 50]
  }

  return priorityItems.map(({ icon, title }, index) => {
    return (
      <PrioritySlider
        key={index}
        icon={icon}
        title={title}
        withLabels={index === 0}
        value={averageValues[index]}
        disabled
      />
    )
  })
}

function WeighIn({ values, onUpdate }) {
  const indexToKey = {
    0: 'urgency',
    1: 'importance',
    2: 'impact',
    3: 'effort',
  }
  return priorityItems.map(({ icon, title }, index) => {
    const key = indexToKey[index]
    const onChange = (e, value) => {
      // override just this value
      const newValues = { ...values, [key]: value / 100 }
      // update parent state
      onUpdate(newValues)
    }
    return (
      <PrioritySlider
        key={index}
        icon={icon}
        title={title}
        withLabels={index === 0}
        value={values[key] * 100}
        onChange={onChange}
      />
    )
  })
}

function PriorityPickerVote({
  goalAddress,
  createGoalVote,
  openToMyVote,
  whoami,
  updateGoalVote,
  votes,
  archiveGoalVote,
}) {
  const [openMyVote, setOpenMyVote] = useState(openToMyVote)

  const myVote = votes.find(value => {
    return value.agent_address === whoami.entry.headerHash
  })

  const defaultValues = {
    urgency: 0.5,
    importance: 0.5,
    impact: 0.5,
    effort: 0.5,
  }
  const [values, setValues] = useState(myVote || defaultValues)
  const onUpdateVote = () => {
    const goal_vote = {
      ...values,
      goal_address: goalAddress,
      agent_address: whoami.entry.headerHash,
      unix_timestamp: moment().unix(),
      is_imported: false
    }
    updateGoalVote(goal_vote, myVote.headerHash)
  }

  const createVote = async () => {
    await createGoalVote({
      ...values,
      goal_address: goalAddress,
      agent_address: whoami.entry.headerHash,
      unix_timestamp: moment().unix(),
      is_imported: false
    })
    setOpenMyVote(true)
  }

  // aggregated-priority-title
  // my-vote-title
  const priorityTabClassname = 'priority-tab'
  let aggClassName = priorityTabClassname
  let myVoteClassName = priorityTabClassname
  // if (!myVote) {
  //   myVoteClassName += ' disabled'
  // }
  if (openMyVote) {
    myVoteClassName += ' active'
  } else {
    aggClassName += ' active'
  }
  const handleArchive = () => {
    const vote = votes.find(value => {
      return value.agent_address === whoami.entry.headerHash
    })
    if (!vote) return
    setOpenMyVote(false)
    archiveGoalVote(vote.headerHash)
    setValues(defaultValues)
  }

  return (
    <>
      {/* Weigh In / Vote */}
      <div className='priority-tabs'>
        <div className='my-vote-tab-wrapper'>
          <div className='my-vote-tab-header'>
            <div
              className={`${myVoteClassName} priority-tab-with-icon`}
              onClick={() => setOpenMyVote(!openMyVote)}>
              {myVote ? 'My Vote' : 'Weigh In'}
              <Icon
                name='arrow-right.svg'
                size='very-small'
                className='enter-icon'
              />
            </div>
            {/* my vote info */}
            {myVote && (
              <div className='my-vote-info'>
                Last Modified{' '}
                {moment.unix((myVote || {}).unix_timestamp).calendar(null, {
                  lastDay: '[Yesterday at] LT',
                  sameDay: '[Today at] LT',
                  nextDay: '[Tomorrow at] LT',
                  lastWeek: '[last] dddd LT',
                  nextWeek: 'dddd LT',
                  sameElse: 'L LT',
                })}
              </div>
            )}
          </div>
          <div className={`my-vote ${openMyVote ? 'active' : ''}`}>
            <>
              {/* weigh in items */}
              <WeighIn values={values} onUpdate={setValues} />
              <div className='my-vote-buttons'>
                <div
                  className='save-my-vote'
                  onClick={myVote ? onUpdateVote : createVote}>
                  {myVote ? 'Update' : 'Save'} my vote
                </div>
                {/* remove my vote */}
                {myVote && (
                  <div className='remove-my-vote' onClick={handleArchive}>
                    Remove my vote
                  </div>
                )}
              </div>
            </>
          </div>
        </div>
      </div>

      <CSSTransition
        in={!openMyVote}
        timeout={400}
        className={`aggregated-votes-animation priority-tabs aggregated-priority-wrapper ${openMyVote ? 'closed' : ''
          }`}>
        <div>
          <div
            className={`${aggClassName} priority-tab-with-icon`}
            onClick={() => setOpenMyVote(!openMyVote)}>
            Aggregated Priority
            <Icon
              name='arrow-right.svg'
              size='very-small'
              className='enter-icon'
            />
          </div>
          <div className='aggregated-priority-inputs'>
            {votes.length} inputs
          </div>
          {/* Aggregated Priority */}
          <CSSTransition
            in={!openMyVote}
            timeout={400}
            className='aggregated-votes-wrapper'
            unmountOnExit>
            <div>
              <Aggregated votes={votes} />
              {/* TODO: built this locate card on view feature */}
              {/* <div className='priority-wrapper-footer'>
              <Icon size='small' name='sort-asc.svg' />
              Locate this card on priority view mode
            </div> */}
            </div>
          </CSSTransition>
        </div>
      </CSSTransition>
    </>
  )
}

function mapStateToProps(state, ownProps) {
  const { projectId, goalAddress } = ownProps
  // filters all the GoalVotes down to a list
  // of only the Votes on the selected Goal
  const goalVotes = state.projects.goalVotes[projectId] || {}
  const allVotesArray = Object.values(goalVotes)
  const votes = allVotesArray.filter(function (goalVote) {
    return goalVote.goal_address === goalAddress
  })
  return {
    whoami: state.whoami,
    goalAddress,
    votes,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    createGoalVote: payload => {
      return dispatch(createGoalVote.create({ cellIdString, payload }))
    },
    updateGoalVote: (entry, headerHash) => {
      return dispatch(
        updateGoalVote.create({ cellIdString, payload: { entry, headerHash } })
      )
    },
    archiveGoalVote: payload => {
      return dispatch(archiveGoalVote.create({ cellIdString, payload }))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityPickerVote)
