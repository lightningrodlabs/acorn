import React, { useEffect, useRef } from 'react'
import {
  Redirect,
  Route,
  Switch,
  useParams,
  useLocation,
} from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AppClient } from '@holochain/client'

import { GO_TO_OUTCOME } from '../../searchParams'
import MapView from './MapView/MapView.connector'
import PriorityView from './PriorityView/PriorityView.connector'
import TableView from './TableView/TableView.connector'
import ConnectedExpandedViewMode from '../../components/ExpandedViewMode/ExpandedViewMode.connector'

import ComputedOutcomeContext from '../../context/ComputedOutcomeContext'
import { AgentPubKeyB64, CellIdString, ActionHashB64 } from '../../types/shared'
import {
  ComputedOutcome,
  Outcome,
  CreateOutcomeWithConnectionInput,
} from '../../types'
import selectAndComputeOutcomes from '../../selectors/computeOutcomes'
import selectOutcomeAndAncestors from '../../selectors/outcomeAndAncestors'
import { getAdminWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import { isWeContext } from '@theweave/api'

export type ProjectViewInnerOwnProps = {
  projectId: CellIdString
  entryPointActionHashes: ActionHashB64[]
  appWebsocket?: AppClient
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
  goInstantlyToOutcome: (outcomeActionHash: ActionHashB64) => void
  triggerUpdateLayout: (instant?: boolean) => void
  // remote / holochain calls
  createOutcomeWithConnection: (
    outcomeWithConnection: CreateOutcomeWithConnectionInput
  ) => Promise<void>
  updateOutcome: (outcome: Outcome, actionHash: ActionHashB64) => Promise<void>
  fetchProjectMeta: () => Promise<void>
  fetchEntryPoints: () => Promise<void>
  fetchMembers: () => Promise<void>
  fetchOutcomes: () => Promise<void>
  fetchConnections: () => Promise<void>
  fetchOutcomeMembers: () => Promise<void>
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
  entryPointActionHashes,
  // local only actions
  openExpandedView,
  closeExpandedView,
  resetProjectView,
  setActiveProject,
  setActiveEntryPoints,
  goInstantlyToOutcome,
  triggerUpdateLayout,
  // remote / holochain calls
  createOutcomeWithConnection,
  updateOutcome,
  fetchProjectMeta,
  fetchMembers,
  fetchEntryPoints,
  fetchOutcomes,
  fetchConnections,
  fetchOutcomeMembers,
  fetchOutcomeComments,
  fetchTags,
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
    const fetchData = async () => {
      try {
        // pushes this new projectId into the store/state
        setActiveProject(projectId)
        if (!isWeContext()) {
          // authorize zome calls on each page refresh
          const adminWs = await getAdminWs()
          await adminWs.authorizeSigningCredentials(cellIdFromString(projectId))
        }

        triggerRealtimeInfoSignal()
        fetchProjectMeta()
        // these do not affect map view layout
        fetchMembers()
        fetchEntryPoints()
        fetchOutcomeComments()
        // once Outcomes, Connections, Outcome Members, and Tags which all
        //  affect layout are all fetched
        // we then animate to a specific outcome if it was set in the path
        // as a search query param
        // this version of fetchOutcomes and fetchConnections have been instructed
        // to not perform a layout update and animation
        await Promise.all([
          fetchOutcomeMembers(),
          fetchTags(),
          fetchOutcomes(),
          fetchConnections(),
        ])
        // fetched all necessary data to perform layout
        // so perform the layout
        const instant = true
        triggerUpdateLayout(instant)

        // now, adjust the translation of the Map View
        goInstantlyToOutcome(goToOutcomeActionHash)
      } catch (error) {
        console.error('An error occurred while fetching data:', error)
      }
    }

    fetchData()

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
          createOutcomeWithConnection={createOutcomeWithConnection}
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
