import React, { useEffect, useRef } from 'react'
import {
  Redirect,
  Route,
  Switch,
  useParams,
  useLocation,
} from 'react-router-dom'
import { useSelector } from 'react-redux'

import { GO_TO_OUTCOME } from '../../searchParams'
import MapView from './MapView/MapView.connector'
import PriorityView from './PriorityView/PriorityView'
import TableView from './TableView/TableView.connector'
import ConnectedExpandedViewMode from '../../components/ExpandedViewMode/ExpandedViewMode.connector'

import ComputedOutcomeContext from '../../context/ComputedOutcomeContext'
import { AgentPubKeyB64, CellIdString, ActionHashB64 } from '../../types/shared'
import { ComputedOutcome, Outcome } from '../../types'
import selectAndComputeOutcomes from '../../selectors/computeOutcomes'
import selectOutcomeAndAncestors from '../../selectors/outcomeAndAncestors'

export type ProjectViewInnerOwnProps = {
  projectId: CellIdString
  entryPointActionHashes: ActionHashB64[]
}

export type ProjectViewInnerConnectorStateProps = {
  expandedViewOutcomeActionHash: ActionHashB64
  activeAgentPubKey: AgentPubKeyB64
}

export type ProjectViewInnerConnectorDispatchProps = {
  // local only
  openExpandedView: (actionHash: ActionHashB64) => void
  closeExpandedView: () => void
  resetProjectView: () => void
  setActiveProject: (projectId: CellIdString) => void
  setActiveEntryPoints: (entryPointActionHashes: ActionHashB64[]) => void
  goToOutcome: (outcomeActionHash: ActionHashB64) => void
  // remote / holochain calls
  updateOutcome: (outcome: Outcome, actionHash: ActionHashB64) => Promise<void>
  fetchProjectMeta: () => Promise<void>
  fetchEntryPoints: () => Promise<void>
  fetchMembers: () => Promise<void>
  fetchOutcomes: () => Promise<void>
  fetchConnections: () => Promise<void>
  fetchOutcomeMembers: () => Promise<void>
  fetchOutcomeVotes: () => Promise<void>
  fetchOutcomeComments: () => Promise<void>
  fetchTags: () => Promise<void>
  triggerRealtimeInfoSignal: () => void
}

export type ProjectViewInnerProps = ProjectViewInnerOwnProps &
  ProjectViewInnerConnectorStateProps &
  ProjectViewInnerConnectorDispatchProps

const ProjectViewInner: React.FC<ProjectViewInnerProps> = ({
  projectId,
  activeAgentPubKey,
  expandedViewOutcomeActionHash,
  openExpandedView,
  closeExpandedView,
  entryPointActionHashes,
  resetProjectView,
  setActiveProject,
  setActiveEntryPoints,
  updateOutcome,
  fetchProjectMeta,
  fetchMembers,
  fetchEntryPoints,
  fetchOutcomes,
  fetchConnections,
  fetchOutcomeMembers,
  fetchOutcomeVotes,
  fetchOutcomeComments,
  fetchTags,
  goToOutcome,
  triggerRealtimeInfoSignal,
}) => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const goToOutcomeActionHash = searchParams.get(GO_TO_OUTCOME)
  const sendRealtimeInfoFrequency = 10000
  const instance = useRef<NodeJS.Timeout>()

  // we use useSelector + createSelector here
  // to prevent inefficient CPU expensive calls to outcomesAsTrees
  // which is responsible for calculating the 'shape of the tree'
  const computedOutcomes = useSelector(selectAndComputeOutcomes)
  const outcomeAndAncestorActionHashes = useSelector(selectOutcomeAndAncestors)

  let expandedViewOutcome: ComputedOutcome
  let expandedViewOutcomeAndAncestors: ComputedOutcome[] = []
  if (expandedViewOutcomeActionHash) {
    expandedViewOutcome =
      computedOutcomes.computedOutcomesKeyed[expandedViewOutcomeActionHash]

    // for breadcrumbs
    expandedViewOutcomeAndAncestors = outcomeAndAncestorActionHashes.map(
      (actionHash) => {
        return computedOutcomes.computedOutcomesKeyed[actionHash]
      }
    )
  }

  function ifMapGoToOutcome(outcomeActionHash: ActionHashB64) {
    // TODO
    // HACK
    // we wait 100 ms because we wait for
    // any integration and processing of the final location of Outcomes
    // this relates to the animation defined in src/animations/layout.js
    // `performLayoutAnimation`
    if (location.pathname.includes('map')) {
      setTimeout(() => {
        if (outcomeActionHash) {
          goToOutcome(outcomeActionHash)
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
    ifMapGoToOutcome(goToOutcomeActionHash)
  }, [goToOutcomeActionHash])

  useEffect(() => {
    // pushes this new projectId into the store/state
    setActiveProject(projectId)
    triggerRealtimeInfoSignal()
    fetchProjectMeta()
    fetchMembers()
    fetchEntryPoints()
    fetchTags()
    // once Outcomes and Connections, which affect layout are both
    // 1. fetched, and
    // 2. animated to their final position
    // we then animate to a specific outcome if it was set in the path
    // as a search query param
    Promise.all([fetchOutcomes(), fetchConnections()]).then(() => {
      ifMapGoToOutcome(goToOutcomeActionHash)
    })
    fetchOutcomeMembers()
    fetchOutcomeVotes()
    fetchOutcomeComments()
    // this will get called to unmount the component
    return resetProjectView
  }, [projectId])

  useEffect(() => {
    setActiveEntryPoints(entryPointActionHashes)
  }, [JSON.stringify(entryPointActionHashes)])

  return (
    <>
      <ComputedOutcomeContext.Provider value={computedOutcomes}>
        <Switch>
          <Route path="/project/:projectId/map" component={MapView} />
          <Route path="/project/:projectId/priority" component={PriorityView} />
          <Route path="/project/:projectId/table" component={TableView} />
          <Route exact path="/project/:projectId" component={ProjectRedirect} />
        </Switch>
        <ConnectedExpandedViewMode
          activeAgentPubKey={activeAgentPubKey}
          projectId={projectId}
          openExpandedView={openExpandedView}
          onClose={closeExpandedView}
          outcome={expandedViewOutcome}
          outcomeAndAncestors={expandedViewOutcomeAndAncestors}
          updateOutcome={updateOutcome}
        />
      </ComputedOutcomeContext.Provider>
    </>
  )
}

function ProjectRedirect() {
  const { projectId } = useParams<{ projectId: CellIdString }>()
  return <Redirect to={`/project/${projectId}/map`} />
}

export default ProjectViewInner
