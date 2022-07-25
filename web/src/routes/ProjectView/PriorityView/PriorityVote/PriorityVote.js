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

import './PriorityVote.scss'

import Avatar from '../../../../components/Avatar/Avatar'
import priorityMenuItems from '../../../../components/Header/priorityMenuItems'
import PriorityQuadrant from '../../../../components/PriorityQuadrant/PriorityQuadrant'
import PriorityPicker from '../../../../components/PriorityPicker/PriorityPicker.connector'
import outcomesAsTrees from '../../../../redux/persistent/projects/outcomes/outcomesAsTrees'
import { CSSTransition } from 'react-transition-group'

function Quadrants({
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
      <PriorityQuadrant
        projectId={projectId}
        title={topLeft.title}
        outcomes={topLeft.outcomes}
        whoami={whoami}
        setPriorityPickerAddress={setPriorityPickerAddress}
      />
      <PriorityQuadrant
        projectId={projectId}
        title={topRight.title}
        outcomes={topRight.outcomes}
        whoami={whoami}
        setPriorityPickerAddress={setPriorityPickerAddress}
      />
      <PriorityQuadrant
        projectId={projectId}
        title={bottomLeft.title}
        outcomes={bottomLeft.outcomes}
        whoami={whoami}
        setPriorityPickerAddress={setPriorityPickerAddress}
      />
      <PriorityQuadrant
        projectId={projectId}
        title={bottomRight.title}
        outcomes={bottomRight.outcomes}
        whoami={whoami}
        setPriorityPickerAddress={setPriorityPickerAddress}
      />
    </div>
  )
}

function getSubsetOfOutcomesBasedOnContext(outcomeTrees, contextOutcomeAddress) {
  if (!contextOutcomeAddress) {
    return outcomeTrees
  }

  // use recursion to find the outcome down in the tree
  function checkForOutcomeInChildren(outcome) {
    const foundInChildren = outcome.children.find(
      g => g.actionHash === contextOutcomeAddress
    )
    if (foundInChildren) {
      return foundInChildren
    } else {
      // use .find to early exit when
      // it finds one that matches
      const foundInChildrensChildren = outcome.children.find(g => {
        return checkForOutcomeInChildren(g)
      })
      if (foundInChildrensChildren) {
        return checkForOutcomeInChildren(foundInChildrensChildren)
      } else {
        return null
      }
    }
  }
  const outcome = checkForOutcomeInChildren({ children: outcomeTrees })
  if (outcome) {
    return outcome.children
  } else {
    return outcomeTrees
  }
}

function UrgencyImportanceQuadrants({
  projectId,
  outcomeTrees,
  outcomeVotes,
  setPriorityPickerAddress
}) {
  const location = useLocation()
  const contextOutcomeAddress = new URLSearchParams(location.search).get(
    'contextOutcome'
  )
  const outcomes = getSubsetOfOutcomesBasedOnContext(outcomeTrees, contextOutcomeAddress)
  const outcomeLists = getSortedAveragesOutcomeLists(
    outcomes,
    outcomeVotes,
    'urgency',
    'importance'
  )

  const topLeft = {
    title: 'More Urgent & More Important',
    outcomes: outcomeLists[0]
  }
  const topRight = {
    title: 'Less Urgent & More Important',
    outcomes: outcomeLists[1]
  }
  const bottomLeft = {
    title: 'More Urgent & Less Important',
    outcomes: outcomeLists[2]
  }
  const bottomRight = {
    title: 'Less Urgent & Less important',
    outcomes: outcomeLists[3]
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

function ImpactEffortQuadrants({
  projectId,
  outcomeTrees,
  outcomeVotes,
  setPriorityPickerAddress
}) {
  const location = useLocation()
  const contextOutcomeAddress = new URLSearchParams(location.search).get(
    'contextOutcome'
  )
  const outcomes = getSubsetOfOutcomesBasedOnContext(outcomeTrees, contextOutcomeAddress)
  const outcomeLists = getSortedAveragesOutcomeLists(
    outcomes,
    outcomeVotes,
    'impact',
    'effort'
  )

  const topLeft = {
    title: 'More Impact & Less Effort',
    outcomes: outcomeLists[0]
  }
  const topRight = {
    title: 'Less Impact & Less Effort',
    outcomes: outcomeLists[1]
  }
  const bottomLeft = {
    title: 'More Impact & More Effort',
    outcomes: outcomeLists[2]
  }
  const bottomRight = {
    title: 'Less Impact & More Effort',
    outcomes: outcomeLists[3]
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

function Uncategorized({
  projectId,
  outcomeTrees,
  outcomeVotes,
  setPriorityPickerAddress
}) {
  const location = useLocation()
  const contextOutcomeAddress = new URLSearchParams(location.search).get(
    'contextOutcome'
  )
  const outcomes = getSubsetOfOutcomesBasedOnContext(outcomeTrees, contextOutcomeAddress)
  const outcomeList = outcomes.filter(outcome => {
    // if there are no Votes, this Outcome is "uncategorized"
    return !outcomeVotes.find(gv => gv.outcomeActionHash === outcome.actionHash)
  })
  return (
    <div className='priority-wrapper-full-height'>
      <PriorityQuadrant
        projectId={projectId}
        title='Uncategorized'
        titleClassname='bottom-left'
        outcomes={outcomeList}
        setPriorityPickerAddress={setPriorityPickerAddress}
      />
    </div>
  )
}

function PriorityVote({ projectId, outcomeTrees, outcomeVotes }) {
  const [priorityPickerAddress, setPriorityPickerAddress] = useState(null)
  const [priorityPickerOpen, setPriorityPickerOpen] = useState(false)

  useEffect(() => {
    if (priorityPickerAddress) {
      setPriorityPickerOpen(true)
    }
  }, [priorityPickerAddress])

  return (
    <>

      <Switch>
        {/* impact - effort */}
        <Route path={priorityMenuItems[1][1]}>
          <ImpactEffortQuadrants
            projectId={projectId}
            outcomeTrees={outcomeTrees}
            outcomeVotes={outcomeVotes}
            setPriorityPickerAddress={setPriorityPickerAddress}
          />
        </Route>
        {/* uncategorized */}
        {/* TODO: change 2 back to 6 when the other modes come online */}
        <Route path={priorityMenuItems[2][1]}>
          <Uncategorized
            projectId={projectId}
            outcomeTrees={outcomeTrees}
            outcomeVotes={outcomeVotes}
            setPriorityPickerAddress={setPriorityPickerAddress}
          />
        </Route>
        {/* urgency - importance */}
        <Route path={priorityMenuItems[0][1]}>
          <UrgencyImportanceQuadrants
            projectId={projectId}
            outcomeTrees={outcomeTrees}
            outcomeVotes={outcomeVotes}
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
          <div className="priority-view-picker-background">
            <PriorityPicker
              projectId={projectId}
              openToMyVote
              outcomeActionHash={priorityPickerAddress}
              onClose={() => setPriorityPickerOpen(false)}
            />
          </div>
        </div>
      </CSSTransition>
    </>
  )
}

function PriorityRedirect() {
  const { projectId } = useParams()
  return <Redirect to={`/project/${projectId}/priority/urgency-importance`} />
}

function getSortedAveragesOutcomeLists(
  allOutcomes,
  outcomeVotes,
  voteKeyOne,
  voteKeyTwo
) {
  const NO_VOTES = 'no_votes'
  // first calculate averages
  const outcomesWithPriorityAverages = allOutcomes
    .map(outcome => {
      const votes = outcomeVotes.filter(gv => gv.outcomeActionHash === outcome.actionHash)
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
        ...outcome,
        averageValues,
        averageAverage
      }
    })
    .filter(outcome => outcome.averageValues !== NO_VOTES)

  function sortByAverageAverage(a, b) {
    return a.averageAverage < b.averageAverage ? 1 : -1
  }

  return [
    // top left
    outcomesWithPriorityAverages
      .filter(outcome => {
        return outcome.averageValues[0] > 50 && outcome.averageValues[1] > 50
      })
      .sort(sortByAverageAverage),
    // top right
    outcomesWithPriorityAverages
      .filter(outcome => {
        return outcome.averageValues[0] <= 50 && outcome.averageValues[1] > 50
      })
      .sort(sortByAverageAverage),
    // bottom left
    outcomesWithPriorityAverages
      .filter(outcome => {
        return outcome.averageValues[0] > 50 && outcome.averageValues[1] <= 50
      })
      .sort(sortByAverageAverage),
    // bottom right
    outcomesWithPriorityAverages
      .filter(outcome => {
        return outcome.averageValues[0] <= 50 && outcome.averageValues[1] <= 50
      })
      .sort(sortByAverageAverage)
  ]
}

function mapDispatchToProps(dispatch) {
  return {}
}

function mapStateToProps(state) {
  const projectId = state.ui.activeProject
  const outcomeVotes = state.projects.outcomeVotes[projectId] || {}

  const data = {
    agents: state.agents,
    outcomes: state.projects.outcomes[projectId] || {},
    connections: state.projects.connections[projectId] || {},
    outcomeMembers: state.projects.outcomeMembers[projectId] || {},
    outcomeVotes: state.projects.outcomeVotes[projectId] || {},
    outcomeComments: state.projects.outcomeComments[projectId] || {}
  }

  const outcomeTrees = outcomesAsTrees(data, { withMembers: true })

  return {
    projectId,
    outcomeTrees,
    outcomeVotes: Object.values(outcomeVotes)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityVote)
