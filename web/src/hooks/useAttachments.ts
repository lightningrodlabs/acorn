import { useState, useRef, useEffect } from 'react'
import { AppletInfo, AssetLocationAndInfo, WAL } from '@theweave/api'
import { getWeaveClient } from '../hcWebsockets'
import { decodeHashFromBase64, EntryHash } from '@holochain/client'
import { CellIdWrapper } from '../domain/cellId'
import { ComputedOutcome } from '../types'

export type AssetMeta = AssetLocationAndInfo & {
  wal: WAL
  appletInfo: AppletInfo
  relationHash: EntryHash
}

export function useAttachments({
  projectId,
  outcome,
}: {
  projectId: string
  outcome: ComputedOutcome
}) {
  const cellIdWrapper = CellIdWrapper.fromCellIdString(projectId)
  const wal: WAL = {
    hrl: [cellIdWrapper.getDnaHash(), decodeHashFromBase64(outcome.actionHash)],
    context: 'outcome',
  }
  const [attachmentWALs, setAttachmentWALs] = useState<WAL[] | null>(null)
  const [attachmentsInfo, setAttachmentsInfo] = useState<AssetMeta[]>([])
  const [error, setError] = useState(null)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    const fetchAssetInfo = async () => {
      const weaveClient = getWeaveClient()

      // Clean up any existing subscription before creating a new one
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }

      try {
        subscriptionRef.current = weaveClient.assets
          .assetStore(wal)
          .subscribe(async (store) => {
            if (store.status === 'complete') {
              const value = store.value
              const links = value.linkedFrom
              const wals = links.map((link) => link.wal)
              setAttachmentWALs(wals)
              const assetInfos: AssetMeta[] = await Promise.all(
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
            }
          })
      } catch (err) {
        setError(err)
      }
    }

    fetchAssetInfo()

    // Cleanup function to unsubscribe when the component unmounts or dependencies change
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [projectId, outcome.actionHash]) // Dependencies that should trigger a refetch

  return { attachmentWALs, attachmentsInfo, error }
}
