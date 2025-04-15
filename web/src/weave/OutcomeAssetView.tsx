import React, { useEffect, useState } from 'react'
import { WAL } from '@theweave/api'
import { encodeHashToBase64 } from '@holochain/client'
import ConnectedExpandedViewMode from '../components/ExpandedViewMode/ExpandedViewMode.connector'
import { AcornState } from './acornState'
import { getAppWs } from '../hcWebsockets'
import { CellIdString, ActionHashB64 } from '../types/shared'
import AppWebsocketContext from '../context/AppWebsocketContext'

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

  useEffect(() => {
    const fetchOutcomeDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        // The WAL contains [DnaHash, EntryHash | ActionHash]
        // For outcomes, the second element is the ActionHash
        const [, actionHash] = wal.hrl // Assuming hrl structure [DnaHash, ActionHash]
        if (!actionHash) {
          throw new Error('Invalid WAL structure: ActionHash missing.')
        }
        const actionHashB64 = encodeHashToBase64(actionHash)

        // Assume getAppWs provides the necessary AppClient instance
        const appWs = await getAppWs()
        if (!appWs) {
          throw new Error('AppClient not available.')
        }
        setAppWs(appWs)
        const acornState = await AcornState.fromAppClient(appWs)

        const outcomeInfo = acornState.findOutcomeByActionHashB64(actionHashB64)

        if (outcomeInfo) {
          setProjectId(outcomeInfo.cellIdWrapper.getCellIdString())
          setOutcomeActionHash(outcomeInfo.outcome.actionHash)
        } else {
          throw new Error(`Outcome with ActionHash ${actionHashB64} not found.`)
        }
      } catch (e) {
        console.error('Error fetching outcome details:', e)
        setError(e.message || 'Failed to load outcome details.')
      } finally {
        setLoading(false)
      }
    }

    if (wal) {
      fetchOutcomeDetails()
    }
  }, [wal])

  if (loading) {
    return <div>Loading Outcome...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (projectId && outcomeActionHash) {
    // Render ConnectedExpandedViewMode with initial props
    // It will handle its internal state and data fetching based on these props
    return (
      <AppWebsocketContext.Provider value={appWs}>
        <ConnectedExpandedViewMode
          initialProjectId={projectId}
          initialOutcomeActionHash={outcomeActionHash}
          // The following props are managed internally by ConnectedExpandedViewMode
          // when initial props are provided, or might need context/redux setup
          // if used in a different standalone way. For now, we rely on its internal logic.
          projectId={projectId} // Pass projectId for consistency if needed internally
          openExpandedView={() => {}} // Placeholder/No-op for root render
          activeAgentPubKey={''} // Placeholder, might need context/redux
          outcome={null} // Placeholder, EVM fetches based on initialOutcomeActionHash
          outcomeAndAncestors={[]} // Placeholder, EVM fetches based on initialOutcomeActionHash
          onClose={() => console.log('Close requested in Asset View')} // Define behavior or make optional
          updateOutcome={async () => {}} // Placeholder/No-op or connect to API
          createOutcomeWithConnection={async () => {}} // Placeholder/No-op or connect to API
          renderAsModal={false} // Tell EVM not to render modal parts
        />
      </AppWebsocketContext.Provider>
    )
  }

  // Fallback if projectId or outcomeActionHash couldn't be determined
  return <div>Outcome details could not be loaded.</div>
}

export default OutcomeAssetView
