import React, { useEffect, useRef } from 'react'
import {
  Redirect,
  Route,
  Switch,
  useParams,
  useLocation,
} from 'react-router-dom'
import { connect, useSelector } from 'react-redux'

import { GO_TO_OUTCOME } from '../../searchParams'
import MapView from './MapView/MapView'
import PriorityView from './PriorityView/PriorityView'
import TableView from './TableView/TableView'
import ExpandedViewMode from '../../components/ExpandedViewMode/ExpandedViewMode.connector'

// data
import { fetchProjectMeta } from '../../redux/persistent/projects/project-meta/actions'
import { fetchEntryPoints } from '../../redux/persistent/projects/entry-points/actions'
import { fetchMembers } from '../../redux/persistent/projects/members/actions'
import { fetchOutcomes } from '../../redux/persistent/projects/outcomes/actions'
import { fetchConnections } from '../../redux/persistent/projects/connections/actions'
import { fetchOutcomeMembers } from '../../redux/persistent/projects/outcome-members/actions'
import { fetchOutcomeComments } from '../../redux/persistent/projects/outcome-comments/actions'
import { fetchOutcomeVotes } from '../../redux/persistent/projects/outcome-votes/actions'
// ui
import { setActiveEntryPoints } from '../../redux/ephemeral/active-entry-points/actions'
import { setActiveProject } from '../../redux/ephemeral/active-project/actions'
import { closeOutcomeForm } from '../../redux/ephemeral/outcome-form/actions'
import { unselectAll } from '../../redux/ephemeral/selection/actions'
import { closeExpandedView } from '../../redux/ephemeral/expanded-view/actions'
import {
  animatePanAndZoom,
  resetTranslateAndScale,
} from '../../redux/ephemeral/viewport/actions'
import { ENTRY_POINTS } from '../../searchParams'
import {
  triggerRealtimeInfoSignal,
  sendExitProjectSignal,
} from '../../redux/persistent/projects/realtime-info-signal/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import { RootState } from '../../redux/reducer'
import outcomesAsTrees from '../../redux/persistent/projects/outcomes/outcomesAsTrees'
import ComputedOutcomeContext from '../../context/ComputedOutcomeContext'

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
  fetchOutcomes,
  fetchConnections,
  fetchOutcomeMembers,
  fetchOutcomeVotes,
  fetchOutcomeComments,
  goToOutcome,
  triggerRealtimeInfoSignal,
}) {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const goToOutcomeHeaderHash = searchParams.get(GO_TO_OUTCOME)
  const sendRealtimeInfoFrequency = 10000
  const instance = useRef()

  // const equalityFn = (left: RootState, right: RootState) => {
  // TODO: perform the equality check, to decide whether to recompute
  // return false
  // }
  const computedOutcomes = useSelector(
    (state: RootState) => {
      const treeData = {
        agents: state.agents,
        outcomes: state.projects.outcomes[projectId] || ({} as any),
        connections: state.projects.connections[projectId] || ({} as any),
        outcomeMembers: state.projects.outcomeMembers[projectId] || ({} as any),
        outcomeVotes: state.projects.outcomeVotes[projectId] || ({} as any),
        outcomeComments:
          state.projects.outcomeComments[projectId] || ({} as any),
      }
      const outcomeTrees = outcomesAsTrees(treeData, { withMembers: true })

      // TODO: map over the outcomes, converting each one from an WithHeaderHash<Outcome>
      // to a ComputedOutcome
      // const computedOutcomes =  outcomes.map((outcome) => {
      // convert outcome
      // return outcome
      // })
      // return the computedOutcomes
      return outcomeTrees
    } /*, equalityFn */
  )

  function ifMapGoToOutcome(outcomeHeaderHash) {
    // TODO
    // HACK
    // we wait 100 ms because we wait for
    // any integration and processing of the final location of Outcomes
    // this relates to the animation defined in src/animations/layout.js
    // `performLayoutAnimation`
    if (location.pathname.includes('map')) {
      setTimeout(() => {
        if (outcomeHeaderHash) {
          goToOutcome(outcomeHeaderHash)
        }
      }, 100)
    }
  }

  // this useEffect is called when the ProjectView component is first mounted, and returns when it is dismounted
  // it sets an interval which calls triggerRealTimeInfoSignal at a fixed rate, until the component is dismounted
  useEffect(() => {
    instance.current = setInterval(
      () => triggerRealtimeInfoSignal(),
      sendRealtimeInfoFrequency
    )
    return () => {
      clearInterval(instance.current)
    }
  }, [])

  useEffect(() => {
    ifMapGoToOutcome(goToOutcomeHeaderHash)
  }, [goToOutcomeHeaderHash])

  useEffect(() => {
    // pushes this new projectId into the store/state
    setActiveProject(projectId)
    triggerRealtimeInfoSignal()
    fetchProjectMeta()
    fetchMembers()
    fetchEntryPoints()
    // once Outcomes and Connections, which affect layout are both
    // 1. fetched, and
    // 2. animated to their final position
    // we then animate to a specific outcome if it was set in the path
    // as a search query param
    Promise.all([fetchOutcomes(), fetchConnections()]).then(() => {
      ifMapGoToOutcome(goToOutcomeHeaderHash)
    })
    //
    fetchOutcomeMembers()
    fetchOutcomeVotes()
    fetchOutcomeComments()
    // this will get called to unmount the component
    return resetProjectView
  }, [projectId])

  useEffect(() => {
    setActiveEntryPoints(entryPointAddresses)
  }, [JSON.stringify(entryPointAddresses)])

  return (
    <>
      <ComputedOutcomeContext.Provider value={computedOutcomes}>
        <Switch>
          <Route path="/project/:projectId/map" component={MapView} />
          <Route path="/project/:projectId/priority" component={PriorityView} />
          <Route path="/project/:projectId/table" component={TableView} />
          <Route exact path="/project/:projectId" component={ProjectRedirect} />
        </Switch>
        <ExpandedViewMode projectId={projectId} onClose={closeExpandedView} />
      </ComputedOutcomeContext.Provider>
    </>
  )
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
  const cellId = cellIdFromString(cellIdString)
  return {
    setActiveProject: (projectId) => dispatch(setActiveProject(projectId)),
    setActiveEntryPoints: (entryPointAddresses) =>
      dispatch(setActiveEntryPoints(entryPointAddresses)),
    resetProjectView: () => {
      dispatch(closeExpandedView())
      dispatch(sendExitProjectSignal()) // send this signal so peers know you left project
      dispatch(closeOutcomeForm())
      dispatch(unselectAll())
      dispatch(resetTranslateAndScale())
    },
    closeExpandedView: () => dispatch(closeExpandedView()),
    fetchProjectMeta: async () => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const projectMeta = await projectsZomeApi.projectMeta.fetchProjectMeta(
        cellId
      )
      dispatch(fetchProjectMeta(cellIdString, projectMeta))
    },
    fetchEntryPoints: async () => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const entryPoints = await projectsZomeApi.entryPoint.fetch(cellId, {
        All: null,
      })
      dispatch(fetchEntryPoints(cellIdString, entryPoints))
    },
    fetchMembers: async () => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const members = await projectsZomeApi.member.fetch(cellId)
      dispatch(fetchMembers(cellIdString, members))
    },
    fetchOutcomes: async () => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomes = await projectsZomeApi.outcome.fetch(cellId, {
        All: null,
      })
      dispatch(fetchOutcomes(cellIdString, outcomes))
    },
    fetchConnections: async () => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const connections = await projectsZomeApi.connection.fetch(cellId, {
        All: null,
      })
      dispatch(fetchConnections(cellIdString, connections))
    },
    fetchOutcomeMembers: async () => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeMembers = await projectsZomeApi.outcomeMember.fetch(cellId, {
        All: null,
      })
      dispatch(fetchOutcomeMembers(cellIdString, outcomeMembers))
    },
    fetchOutcomeVotes: async () => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeVotes = await projectsZomeApi.outcomeVote.fetch(cellId, {
        All: null,
      })
      dispatch(fetchOutcomeVotes(cellIdString, outcomeVotes))
    },
    fetchOutcomeComments: async () => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeComments = await projectsZomeApi.outcomeComment.fetch(
        cellId,
        { All: null }
      )
      dispatch(fetchOutcomeComments(cellIdString, outcomeComments))
    },
    goToOutcome: (outcomeHeaderHash) =>
      dispatch(animatePanAndZoom(outcomeHeaderHash)),
    triggerRealtimeInfoSignal: () => dispatch(triggerRealtimeInfoSignal()),
  }
}

const ProjectView = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectViewInner)

function ProjectViewWrapper() {
  const { projectId } = useParams()
  const location = useLocation()
  let entryPointAddressesRaw = new URLSearchParams(location.search).get(
    ENTRY_POINTS
  )
  let entryPointAddresses = []
  if (entryPointAddressesRaw) {
    entryPointAddresses = entryPointAddressesRaw.split(',')
  }
  return (
    <ProjectView
      projectId={projectId}
      entryPointAddresses={entryPointAddresses}
    />
  )
}

export default ProjectViewWrapper
