import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WAL } from '@theweave/api'
import { encodeHashToBase64 } from '@holochain/client'
import ConnectedExpandedViewMode from '../components/ExpandedViewMode/ExpandedViewMode.connector'
import { AcornState } from './acornState'
import { getAgentPubKey, getAppWs } from '../hcWebsockets'
import { CellIdString, ActionHashB64 } from '../types/shared'
import AppWebsocketContext from '../context/AppWebsocketContext'
import selectAndComputeOutcomes from '../selectors/computeOutcomes'
import selectOutcomeAndAncestors from '../selectors/outcomeAndAncestors'
import { ComputedOutcome, Outcome } from '../types'
import { setActiveProject } from '../redux/ephemeral/active-project/actions'
import { updateOutcome } from '../redux/persistent/projects/outcomes/actions' // Keep updateOutcome
import ProjectsZomeApi from '../api/projectsApi'
import { cellIdFromString } from '../utils'
import constructProjectDataFetchers from '../api/projectDataFetchers' // Add this import

interface OutcomeAssetViewProps {
  wal: WAL
}

const OutcomeAssetView: React.FC<OutcomeAssetViewProps> = ({ wal }) => {
  const [projectId, setProjectId] = useState<CellIdString | null>(null)
  const [
    outcomeActionHash,
    setOutcomeActionHash,
  ] = useState<ActionHashB64 | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [appWs, setAppWs] = useState<any>(null) // Replace with actual type if known
  const agentPubKey = getAgentPubKey()
  const dispatch = useDispatch()
  const computedOutcomes = useSelector(selectAndComputeOutcomes)
  const outcomeAndAncestorActionHashes = useSelector(selectOutcomeAndAncestors)

  const [
    expandedViewOutcome,
    setExpandedViewOutcome,
  ] = useState<ComputedOutcome | null>(null)

  const [
    expandedViewOutcomeAndAncestors,
    setExpandedViewOutcomeAndAncestors,
  ] = useState<ComputedOutcome[]>([])

  // Main effect for fetching initial data based on WAL
  useEffect(() => {
    const fetchOutcomeDetailsAndProjectData = async () => {
      // Renamed function
      setLoading(true)
      setError(null)
      try {
        // Use AcornState primarily to find the project ID and validate outcome existence
        // The WAL contains [DnaHash, EntryHash | ActionHash]
        // For outcomes, the second element is the ActionHash
        const [, actionHash] = wal.hrl // Assuming hrl structure [DnaHash, ActionHash]
        if (!actionHash) {
          throw new Error('Invalid WAL structure: ActionHash missing.')
        }
        const actionHashB64 = encodeHashToBase64(actionHash)

        const appWs = await getAppWs()
        if (!appWs) throw new Error('AppClient not available.')
        setAppWs(appWs)

        const acornState = await AcornState.fromAppClient(appWs)
        const outcomeInfo = acornState.findOutcomeByActionHashB64(actionHashB64)

        if (outcomeInfo) {
          const determinedProjectId = outcomeInfo.cellIdWrapper.getCellIdString()
          setProjectId(determinedProjectId)
          setOutcomeActionHash(outcomeInfo.outcome.actionHash)

          // 1. Set the active project ID in Redux state
          dispatch(setActiveProject(determinedProjectId))

          // 2. Construct fetchers for this project
          const fetchers = constructProjectDataFetchers(dispatch, determinedProjectId)

          // 3. Fetch all project data needed by selectors and the view, similar to ProjectView
          console.log(
            `OutcomeAssetView: Fetching all data for project ${determinedProjectId}`
          )
          // Fetch data concurrently
          await Promise.all([
            // Data affecting layout/computation (ensure skipLayoutAnimation is true where needed in fetchers)
            fetchers.fetchOutcomes(),
            fetchers.fetchConnections(),
            fetchers.fetchOutcomeMembers(),
            fetchers.fetchTags(),
            // Other project data
            fetchers.fetchProjectMeta(),
            fetchers.fetchEntryPoints(),
            fetchers.fetchMembers(),
            fetchers.fetchOutcomeComments(),
            // Note: We don't call triggerUpdateLayout here as OutcomeAssetView
            // doesn't manage the main map/table/priority views layout.
          ])
          console.log(
            `OutcomeAssetView: Finished fetching all data for project ${determinedProjectId}`
          )

          // Data is fetched, Redux state should be updated,
          // selector will re-run, and the other useEffect will handle setting component state.
        } else {
          throw new Error(`Outcome with ActionHash ${actionHashB64} not found.`)
        }
      } catch (e) {
        console.error('Error fetching outcome details and project data:', e)
        setError(e.message || 'Failed to load details.')
      } finally {
        setLoading(false)
      }
    }

    if (wal) {
      fetchOutcomeDetailsAndProjectData() // Call the updated function
    }
  }, [wal, dispatch]) // Dependency array

  // Effect to update component state when computedOutcomes or target actionHash changes
  useEffect(() => {
    if (
      outcomeActionHash &&
      computedOutcomes &&
      computedOutcomes.computedOutcomesKeyed
    ) {
      console.log(
        'OutcomeAssetView: computedOutcomes updated, setting expanded view state',
        { outcomeActionHash, computedOutcomes }
      )
      const targetOutcome =
        computedOutcomes.computedOutcomesKeyed[outcomeActionHash]
      setExpandedViewOutcome(targetOutcome) // Might be undefined if action hash not in computed set yet

      // Assuming outcomeAndAncestorActionHashes selector also works correctly now
      const ancestors = outcomeAndAncestorActionHashes
        .map((actionHash) => computedOutcomes.computedOutcomesKeyed[actionHash])
        .filter(Boolean) // Filter out undefined if any hash not found
      setExpandedViewOutcomeAndAncestors(ancestors)
    } else {
      console.log(
        'OutcomeAssetView: computedOutcomes not ready or missing outcomeActionHash',
        { outcomeActionHash, computedOutcomes }
      )
      // Reset if dependencies are not met
      setExpandedViewOutcome(null)
      setExpandedViewOutcomeAndAncestors([])
    }
    // Depend on computedOutcomes directly to react to its changes
  }, [computedOutcomes, outcomeActionHash, outcomeAndAncestorActionHashes])

  if (loading) {
    // Show loading indicator while fetching project data too
    return <div>Loading Outcome and Project Data...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }
  const updateOutcomeCallback = async (
    outcome: Outcome,
    actionHash: ActionHashB64
  ) => {
    const appWebsocket = await getAppWs()
    const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
    const cellId = cellIdFromString(projectId)
    const outcomeWireRecord = await projectsZomeApi.outcome.update(cellId, {
      entry: outcome,
      actionHash,
    })
    return dispatch(updateOutcome(projectId, outcomeWireRecord))
  }

  if (projectId && outcomeActionHash && expandedViewOutcome) {
    // Render ConnectedExpandedViewMode with initial props
    // It will handle its internal state and data fetching based on these props
    return (
      <AppWebsocketContext.Provider value={appWs}>
        <ConnectedExpandedViewMode
          activeAgentPubKey={agentPubKey}
          projectId={projectId}
          openExpandedView={() => {}}
          onClose={() => {}}
          outcome={expandedViewOutcome}
          outcomeAndAncestors={expandedViewOutcomeAndAncestors}
          updateOutcome={updateOutcomeCallback}
          createOutcomeWithConnection={async () => {}} // Placeholder/No-op
          renderAsModal={false} // Prevent modal rendering
          // gen
          //   initialProjectId={projectId}
          //   initialOutcomeActionHash={outcomeActionHash}
          // The following props are managed internally by ConnectedExpandedViewMode
          // when initial props are provided, or might need context/redux setup
          // if used in a different standalone way. For now, we rely on its internal logic.
          //   projectId={projectId} // Pass projectId for consistency if needed internally
          //   openExpandedView={() => {}} // Placeholder/No-op for root render
          //   activeAgentPubKey={''} // Placeholder, might need context/redux
          //   outcome={null} // Placeholder, EVM fetches based on initialOutcomeActionHash
          //   outcomeAndAncestors={[]} // Placeholder, EVM fetches based on initialOutcomeActionHash
          //   onClose={() => console.log('Close requested in Asset View')} // Define behavior or make optional
          //   updateOutcome={async () => {}} // Placeholder/No-op or connect to API
          //   createOutcomeWithConnection={async () => {}} // Placeholder/No-op or connect to API
          //   renderAsModal={false} // Tell EVM not to render modal parts
        />
      </AppWebsocketContext.Provider>
    )
  }

  // Fallback if projectId or outcomeActionHash couldn't be determined
  return <div>Outcome details could not be loaded.</div>
}

export default OutcomeAssetView
function dispatch(arg0: any) {
  throw new Error('Function not implemented.')
}
