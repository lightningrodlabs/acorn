import { useState, useRef, useEffect } from 'react'
import {
  AppletInfo,
  AssetLocationAndInfo,
  isWeaveContext,
  WAL,
} from '@theweave/api'
import { getWeaveClient } from '../hcWebsockets'
import { decodeHashFromBase64, EntryHash } from '@holochain/client'
import { CellIdWrapper } from '../domain/cellId'
import { ProjectMeta } from '../types'
import { WithActionHash } from '../types/shared'

export type ProjectAssetMeta = AssetLocationAndInfo & {
  wal: WAL
  appletInfo: AppletInfo
  relationHash: EntryHash
}

export function useProjectAttachments({
  projectId,
  projectMeta,
}: {
  projectId: string
  projectMeta: WithActionHash<ProjectMeta>
}) {
  // ✅ Call hooks unconditionally at the top level
  const [attachmentWALs, setAttachmentWALs] = useState<WAL[] | null>(null)
  const [attachmentsInfo, setAttachmentsInfo] = useState<ProjectAssetMeta[]>([])
  const [error, setError] = useState(null)
  const subscriptionRef = useRef<any>(null)

  // Determine if the hook should run its logic
  const shouldRun = isWeaveContext() && projectMeta && projectId

  useEffect(() => {
    // Only run the effect logic if the conditions are met
    if (!shouldRun) {
      // Optional: Reset state if conditions become false after being true
      setAttachmentWALs(null)
      setAttachmentsInfo([])
      setError(null)
      // Ensure cleanup if subscription exists from a previous valid run
      if (
        subscriptionRef.current &&
        typeof subscriptionRef.current.unsubscribe === 'function'
      ) {
        subscriptionRef.current.unsubscribe()
      }
      subscriptionRef.current = null
      return // Exit effect early
    }

    // Conditions are met, proceed with fetching and subscription
    const cellIdWrapper = CellIdWrapper.fromCellIdString(projectId)
    const wal: WAL = {
      hrl: [
        cellIdWrapper.getDnaHash(),
        decodeHashFromBase64(projectMeta.actionHash),
      ],
    }

    const fetchAssetInfo = async () => {
      const weaveClient = getWeaveClient()

      // Clean up any existing subscription before creating a new one
      if (
        subscriptionRef.current &&
        typeof subscriptionRef.current.unsubscribe === 'function'
      ) {
        subscriptionRef.current.unsubscribe()
      }
      subscriptionRef.current = null

      try {
        const subscription = weaveClient.assets
          .assetStore(wal)
          .subscribe(async (store) => {
            if (store.status === 'complete') {
              const value = store.value
              const links = value.linkedFrom
              const wals = links.map((link) => link.wal)
              setAttachmentWALs(wals)
              const assetInfos: ProjectAssetMeta[] = await Promise.all(
                links.map(async (link) => {
                  const assetInfo = await weaveClient.assets.assetInfo(link.wal)
                  const appletInfo = await weaveClient.appletInfo(
                    assetInfo.appletHash
                  )
                  return {
                    wal: link.wal,
                    ...assetInfo,
                    appletInfo,
                    relationHash: link.relationHash,
                  }
                })
              )
              setAttachmentsInfo(assetInfos)
            } else if (store.status === 'error') {
               setError(store.error) // Handle potential errors from the store
            }
          })

        // Store the subscription object properly
        subscriptionRef.current = subscription
      } catch (err) {
        setError(err)
      }
    }

    fetchAssetInfo()

    // Cleanup function to unsubscribe when the component unmounts or dependencies change
    return () => {
      if (
        subscriptionRef.current &&
        typeof subscriptionRef.current.unsubscribe === 'function'
      ) {
        subscriptionRef.current.unsubscribe()
      }
      subscriptionRef.current = null
    }
    // Include `shouldRun` in dependency array to re-run effect if conditions change
  }, [projectId, projectMeta, shouldRun]) // Add projectMeta and shouldRun to dependencies

  // Return default values if conditions aren't met, otherwise return state
  if (!shouldRun) {
    return {
      attachmentWALs: null,
      attachmentsInfo: [],
      error: null,
    }
  }

  return { attachmentWALs, attachmentsInfo, error }
}
