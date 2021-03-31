import React, { useState, useEffect } from 'react'
import {
  NavLink,
  useLocation,
  useParams,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import { connect } from 'react-redux'
import _ from 'lodash'

import IndentedTreeView from '../../../components/IndentedTreeView/IndentedTreeView'

import './PriorityView.css'
import PriorityQuadrant from '../../../components/PriorityQuadrant/PriorityQuadrant'
import PriorityPicker from '../../../components/PriorityPicker/PriorityPicker'
import goalsAsTree from '../../../projects/goals/goalsAsTrees'
import { CSSTransition } from 'react-transition-group'

function Quadrants ({
  projectId,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  whoami,
  setPriorityPickerAddress
}) {
  return (
    <div className='priority-quadrants-wrapper'>
      <div className='priority-quadrants-content'>
        <div className='priority-quadrants-row'>
          <PriorityQuadrant
            projectId={projectId}
            title={topLeft.title}
            titleClassname='top-left'
            goals={topLeft.goals}
            whoami={whoami}
            setPriorityPickerAddress={setPriorityPickerAddress}
          />
          <div className='priority-quadrants-vertical-divider'></div>
          <PriorityQuadrant
            projectId={projectId}
            title={topRight.title}
            titleClassname='top-right'
            goals={topRight.goals}
            whoami={whoami}
            setPriorityPickerAddress={setPriorityPickerAddress}
          />
        </div>
        <div className='priority-quadrants-horizontal-divider'></div>
        <div className='priority-quadrants-row'>
          <PriorityQuadrant
            projectId={projectId}
            title={bottomLeft.title}
            titleClassname='bottom-left'
            goals={bottomLeft.goals}
            whoami={whoami}
            setPriorityPickerAddress={setPriorityPickerAddress}
          />
          <div className='priority-quadrants-vertical-divider'></div>
          <PriorityQuadrant
            projectId={projectId}
            title={bottomRight.title}
            titleClassname='bottom-right'
            goals={bottomRight.goals}
            whoami={whoami}
            setPriorityPickerAddress={setPriorityPickerAddress}
          />
        </div>
      </div>
    </div>
  )
}

function getSubsetOfGoalsBasedOnContext (goalTrees, contextGoalAddress) {
  if (!contextGoalAddress) {
    return goalTrees
  }

  // use recursion to find the goal down in the tree
  function checkForGoalInChildren (goal) {
    const foundInChildren = goal.children.find(
      g => g.address === contextGoalAddress
    )
    if (foundInChildren) {
      return foundInChildren
    } else {
      // use .find to early exit when
      // it finds one that matches
      const foundInChildrensChildren = goal.children.find(g => {
        return checkForGoalInChildren(g)
      })
      if (foundInChildrensChildren) {
        return checkForGoalInChildren(foundInChildrensChildren)
      } else {
        return null
      }
    }
  }
  const goal = checkForGoalInChildren({ children: goalTrees })
  if (goal) {
    return goal.children
  } else {
    return goalTrees
  }
}

function UrgencyImportanceQuadrants ({
  projectId,
  goalTrees,
  goalVotes,
  setPriorityPickerAddress
}) {
  const location = useLocation()
  const contextGoalAddress = new URLSearchParams(location.search).get(
    'contextGoal'
  )
  const goals = getSubsetOfGoalsBasedOnContext(goalTrees, contextGoalAddress)
  const goalLists = getSortedAveragesGoalLists(
    goals,
    goalVotes,
    'urgency',
    'importance'
  )

  const topLeft = {
    title: 'More Urgent & More Important',
    goals: goalLists[0]
  }
  const topRight = {
    title: 'More Urgent & Less Important',
    goals: goalLists[1]
  }
  const bottomLeft = {
    title: 'Less Urgent & More Important',
    goals: goalLists[2]
  }
  const bottomRight = {
    title: 'Less Urgent & Less important',
    goals: goalLists[3]
  }
  return (
    <Quadrants
      {...{
        projectId,
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
        setPriorityPickerAddress
      }}
    />
  )
}

function ImpactEffortQuadrants ({
  projectId,
  goalTrees,
  goalVotes,
  setPriorityPickerAddress
}) {
  const location = useLocation()
  const contextGoalAddress = new URLSearchParams(location.search).get(
    'contextGoal'
  )
  const goals = getSubsetOfGoalsBasedOnContext(goalTrees, contextGoalAddress)
  const goalLists = getSortedAveragesGoalLists(
    goals,
    goalVotes,
    'impact',
    'effort'
  )

  const topLeft = {
    title: 'More Impact & Less Effort',
    goals: goalLists[0]
  }
  const topRight = {
    title: 'Less Impact & Less Effort',
    goals: goalLists[1]
  }
  const bottomLeft = {
    title: 'More Impact & More Effort',
    goals: goalLists[2]
  }
  const bottomRight = {
    title: 'Less Impact & More Effort',
    goals: goalLists[3]
  }
  return (
    <Quadrants
      {...{
        projectId,
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
        setPriorityPickerAddress
      }}
    />
  )
}

function Uncategorized ({
  projectId,
  goalTrees,
  goalVotes,
  setPriorityPickerAddress
}) {
  const location = useLocation()
  const contextGoalAddress = new URLSearchParams(location.search).get(
    'contextGoal'
  )
  const goals = getSubsetOfGoalsBasedOnContext(goalTrees, contextGoalAddress)
  const goalList = goals.filter(goal => {
    // if there are no Votes, this Goal is "uncategorized"
    return !goalVotes.find(gv => gv.goal_address === goal.address)
  })
  return (
    <div className='priority-wrapper-full-height'>
      <PriorityQuadrant
        projectId={projectId}
        title='Uncategorized'
        titleClassname='bottom-left'
        goals={goalList}
        setPriorityPickerAddress={setPriorityPickerAddress}
      />
    </div>
  )
}

function PriorityMenuItem ({ exact, title, slug, projectId }) {
  return (
    <NavLink
      exact={exact}
      to={slug.replace(':projectId', projectId)}
      className='priority-menu-item'
      activeClassName='active'
    >
      {title}
    </NavLink>
  )
}

function PriorityView ({ projectId, goalTrees, goalVotes }) {
  const priorityMenuItems = [
    ['Urgency x Importance', `/project/:projectId/priority/urgency-importance`],
    ['Impact x Effort', '/project/:projectId/priority/impact-effort'],
    // ['Urgency', '/project/:projectId/priority/urgency'],
    // ['Importance', '/project/:projectId/priority/importance'],
    // ['Impact', '/project/:projectId/priority/impact'],
    // ['Effort', '/project/:projectId/priority/effort'],
    ['Uncategorized', '/project/:projectId/priority/uncategorized']
  ]

  const [priorityPickerAddress, setPriorityPickerAddress] = useState(null)
  const [priorityPickerOpen, setPriorityPickerOpen] = useState(false)

  useEffect(() => {
    if (priorityPickerAddress) {
      setPriorityPickerOpen(true)
    }
  }, [priorityPickerAddress])

  return (
    <div className='priority-view-wrapper'>
      <IndentedTreeView goalTrees={goalTrees} />
      <div className='priority-menu-wrapper'>
        {priorityMenuItems.map(([menuTitle, menuSlugs], index) => {
          return (
            <PriorityMenuItem
              key={index}
              exact={index === 0}
              title={menuTitle}
              slug={menuSlugs}
              projectId={projectId}
            />
          )
        })}
      </div>
      <Switch>
        {/* impact - effort */}
        <Route path={priorityMenuItems[1][1]}>
          <ImpactEffortQuadrants
            projectId={projectId}
            goalTrees={goalTrees}
            goalVotes={goalVotes}
            setPriorityPickerAddress={setPriorityPickerAddress}
          />
        </Route>
        {/* uncategorized */}
        {/* TODO: change 2 back to 6 when the other modes come online */}
        <Route path={priorityMenuItems[2][1]}>
          <Uncategorized
            projectId={projectId}
            goalTrees={goalTrees}
            goalVotes={goalVotes}
            setPriorityPickerAddress={setPriorityPickerAddress}
          />
        </Route>
        {/* urgency - importance */}
        <Route path={priorityMenuItems[0][1]}>
          <UrgencyImportanceQuadrants
            projectId={projectId}
            goalTrees={goalTrees}
            goalVotes={goalVotes}
            setPriorityPickerAddress={setPriorityPickerAddress}
          />
        </Route>
        <Route
          exact
          path='/project/:projectId/priority'
          component={PriorityRedirect}
        />
      </Switch>
      <CSSTransition
        in={priorityPickerOpen}
        timeout={300}
        unmountOnExit
        className='priority-view-picker-animation'
        onExited={() => setPriorityPickerAddress(null)}
      >
        <div>
          <PriorityPicker
            projectId={projectId}
            openToMyVote
            goalAddress={priorityPickerAddress}
            onClose={() => setPriorityPickerOpen(false)}
          />
        </div>
      </CSSTransition>
    </div>
  )
}

function PriorityRedirect () {
  const { projectId } = useParams()
  return <Redirect to={`/project/${projectId}/priority/urgency-importance`} />
}

function getSortedAveragesGoalLists (
  allGoals,
  goalVotes,
  voteKeyOne,
  voteKeyTwo
) {
  const NO_VOTES = 'no_votes'
  // first calculate averages
  const goalsWithPriorityAverages = allGoals
    .map(goal => {
      const votes = goalVotes.filter(gv => gv.goal_address === goal.address)
      let averageValues = NO_VOTES
      let averageAverage
      if (votes.length > 0) {
        averageValues = [0, 0, 0, 0]
        votes.forEach(element => {
          averageValues[0] += element[voteKeyOne] * 100
          averageValues[1] += element[voteKeyTwo] * 100
          // special case for "effort", since higher is "worse"
          // invert its score out of 100
          if (voteKeyTwo === 'effort') {
            averageValues[1] = 100 - averageValues[1]
          }
        })
        averageValues[0] /= votes.length
        averageValues[1] /= votes.length
        averageAverage = (averageValues[0] + averageValues[1]) / 2
      }
      return {
        ...goal,
        averageValues,
        averageAverage
      }
    })
    .filter(goal => goal.averageValues !== NO_VOTES)

  function sortByAverageAverage (a, b) {
    return a.averageAverage < b.averageAverage ? 1 : -1
  }

  return [
    // top left
    goalsWithPriorityAverages
      .filter(goal => {
        return goal.averageValues[0] > 50 && goal.averageValues[1] > 50
      })
      .sort(sortByAverageAverage),
    // top right
    goalsWithPriorityAverages
      .filter(goal => {
        return goal.averageValues[0] <= 50 && goal.averageValues[1] > 50
      })
      .sort(sortByAverageAverage),
    // bottom left
    goalsWithPriorityAverages
      .filter(goal => {
        return goal.averageValues[0] > 50 && goal.averageValues[1] <= 50
      })
      .sort(sortByAverageAverage),
    // bottom right
    goalsWithPriorityAverages
      .filter(goal => {
        return goal.averageValues[0] <= 50 && goal.averageValues[1] <= 50
      })
      .sort(sortByAverageAverage)
  ]
}

function mapDispatchToProps (dispatch) {
  return {}
}

function mapStateToProps (state) {
  const projectId = state.ui.activeProject
  const goalVotes = state.projects.goalVotes[projectId] || {}

  const goalTrees = goalsAsTree(state, { withMembers: true })

  return {
    projectId,
    goalTrees,
    goalVotes: Object.values(goalVotes)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityView)
