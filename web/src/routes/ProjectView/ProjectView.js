import React, { useEffect, useRef } from 'react'
import {
  Redirect,
  Route,
  Switch,
  useParams,
  useLocation,
} from 'react-router-dom'
import { connect } from 'react-redux'

import { GO_TO_GOAL } from '../../searchParams'
import MapView from './MapView/MapView'
import PriorityView from './PriorityView/PriorityView'
import ExpandedViewMode from '../../components/ExpandedViewMode/ExpandedViewMode'

// data
import { fetchProjectMeta } from '../../projects/project-meta/actions'
import { fetchEntryPoints } from '../../projects/entry-points/actions'
import { fetchMembers } from '../../projects/members/actions'
import { fetchGoals } from '../../projects/goals/actions'
import { fetchEdges } from '../../projects/edges/actions'
import { fetchGoalMembers } from '../../projects/goal-members/actions'
import { fetchGoalComments } from '../../projects/goal-comments/actions'
import { fetchGoalVotes } from '../../projects/goal-votes/actions'
// ui
import { setActiveEntryPoints } from '../../active-entry-points/actions'
import { setActiveProject } from '../../active-project/actions'
import { closeGoalForm } from '../../goal-form/actions'
import { unselectAll } from '../../selection/actions'
import { closeExpandedView } from '../../expanded-view/actions'
import { animatePanAndZoom, resetTranslateAndScale } from '../../viewport/actions'
import { ENTRY_POINTS } from '../../searchParams'
import { triggerRealtimeInfoSignal, sendExitProjectSignal } from '../../realtime-info-signal/actions'

function ProjectViewInner({
  projectId,
  closeExpandedView,
  entryPointAddresses,
  resetProjectView,
  setActiveProject,
  setActiveEntryPoints,
  fetchProjectMeta,
  fetchMembers,
  fetchEntryPoints,
  fetchGoals,
  fetchEdges,
  fetchGoalMembers,
  fetchGoalVotes,
  fetchGoalComments,
  goToGoal,
  triggerRealtimeInfoSignal,
  sendExitProjectSignal,
}) {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const goToGoalHeaderHash = searchParams.get(GO_TO_GOAL)
  const sendRealtimeInfoFrequency = 10000
  const instance = useRef() 
  
  function ifMapGoToGoal(goalHeaderHash) {
      // TODO
      // HACK
      // we wait 100 ms because we wait for
      // any integration and processing of the final location of Goals
      // this relates to the animation defined in src/animations/layout.js
      // `performLayoutAnimation`
      if (location.pathname.includes('map')) {
        setTimeout(() => {
          if (goalHeaderHash) {
            goToGoal(goalHeaderHash)
          }
        }, 100)
      }
  }

  // this useEffect is called when the ProjectView component is first mounted, and returns when it is dismounted
  // it sets an interval which calls triggerRealTimeInfoSignal at a fixed rate, until the component is dismounted
  useEffect(() => {
    instance.current = setInterval(() => triggerRealtimeInfoSignal(), sendRealtimeInfoFrequency)
    return () => {
      clearInterval(instance.current)
    }
  }, [])

  useEffect(() => {
    ifMapGoToGoal(goToGoalHeaderHash)
  },[goToGoalHeaderHash])

  useEffect(() => {
    // pushes this new projectId into the store/state
    setActiveProject(projectId)
    triggerRealtimeInfoSignal()
    fetchProjectMeta()
    fetchMembers()
    fetchEntryPoints()
    // once Goals and Edges, which affect layout are both
    // 1. fetched, and
    // 2. animated to their final position
    // we then animate to a specific goal if it was set in the path
    // as a search query param
    Promise.all([fetchGoals(),fetchEdges()]).then(() => {
      ifMapGoToGoal(goToGoalHeaderHash)
    })
    //
    fetchGoalMembers()
    fetchGoalVotes()
    fetchGoalComments()
    // this will get called to unmount the component
    return resetProjectView
  }, [projectId])

  useEffect(() => {
    setActiveEntryPoints(entryPointAddresses)
  }, [JSON.stringify(entryPointAddresses)])

  return (
    <>
      <Switch>
        <Route path='/project/:projectId/map' component={MapView} />
        <Route path='/project/:projectId/priority' component={PriorityView} />
        <Route exact path='/project/:projectId' component={ProjectRedirect} />
      </Switch>
      <ExpandedViewMode projectId={projectId} onClose={closeExpandedView} />
    </>)
}

function ProjectRedirect() {
  const { projectId } = useParams()
  return <Redirect to={`/project/${projectId}/map`} />
}

function mapStateToProps(state, ownProps) {
  return {}
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    setActiveProject: projectId => dispatch(setActiveProject(projectId)),
    setActiveEntryPoints: entryPointAddresses =>
      dispatch(setActiveEntryPoints(entryPointAddresses)),
    resetProjectView: () => {
      dispatch(closeExpandedView())
      dispatch(sendExitProjectSignal()) // send this signal so peers know you left project
      dispatch(closeGoalForm())
      dispatch(unselectAll())
      dispatch(resetTranslateAndScale())
    },
    closeExpandedView: () => dispatch(closeExpandedView()),
    fetchProjectMeta: () =>
      dispatch(fetchProjectMeta.create({ cellIdString, payload: null })),
    fetchEntryPoints: () =>
      dispatch(fetchEntryPoints.create({ cellIdString, payload: { All: null } })),
    fetchMembers: () =>
      dispatch(fetchMembers.create({ cellIdString, payload: null })),
    fetchGoals: () =>
      dispatch(fetchGoals.create({ cellIdString, payload: { All: null } })),
    fetchEdges: () =>
      dispatch(fetchEdges.create({ cellIdString, payload: { All: null } })),
    fetchGoalMembers: () =>
      dispatch(fetchGoalMembers.create({ cellIdString, payload: { All: null } })),
    fetchGoalVotes: () =>
      dispatch(fetchGoalVotes.create({ cellIdString, payload: { All: null } })),
    fetchGoalComments: () =>
      dispatch(fetchGoalComments.create({ cellIdString, payload: { All: null } })),
    goToGoal: (goalHeaderHash) => dispatch(animatePanAndZoom(goalHeaderHash)),
    triggerRealtimeInfoSignal: () => dispatch(triggerRealtimeInfoSignal()),
    sendExitProjectSignal: () => dispatch(sendExitProjectSignal())
  }
}

const ProjectView = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectViewInner)

function ProjectViewWrapper() {
  const { projectId } = useParams()
  const location = useLocation()
  let entryPointAddresses = new URLSearchParams(location.search).get(
    ENTRY_POINTS
  )
  if (entryPointAddresses) {
    entryPointAddresses = entryPointAddresses.split(',')
  } else {
    entryPointAddresses = []
  }
  return (
    <ProjectView
      projectId={projectId}
      entryPointAddresses={entryPointAddresses}
    />
  )
}

export default ProjectViewWrapper
