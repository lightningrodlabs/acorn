import { useState, useRef } from 'react'
import { WAL } from '@theweave/api'
import { getWeaveClient } from '../hcWebsockets'

export function useAttachments(wal: WAL) {
  const [attachments, setAttachments] = useState<WAL[] | null>(null)
  const [error, setError] = useState(null)
  const subscriptionRef = useRef<any>(null)

  const fetchAssetInfo = async () => {
    const weaveClient = getWeaveClient()

    // Clean up any existing subscription before creating a new one
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    try {
      subscriptionRef.current = weaveClient.assets
        .assetStore(wal)
        .subscribe((store) => {
          if (store.status === 'complete') {
            const value = store.value
            const links = value.linkedFrom
            const wals = links.map((link) => link.wal)
            setAttachments(wals)
          }
        })
    } catch (err) {
      setError(err)
    }
  }

  // Manually trigger fetching asset info when needed
  if (!subscriptionRef.current) {
    fetchAssetInfo()
  }

  // Cleanup function to unsubscribe when the hook is no longer used
  const cleanup = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }
  }

  // Return the cleanup function for manual control
  return { attachments, error, cleanup }
}
