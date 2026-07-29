/*
 * Base-DNA visibility: which network family is this install actually on?
 *
 * Two peers only see each other's data when their BASE (provisioned) DNA
 * hashes match — a dev build with a recompiled integrity zome is a different
 * network even with the same project passphrase, and from the inside that is
 * indistinguishable from "nothing shared yet". Surfacing the base hashes lets
 * two users compare installs at a glance (the header version tooltip) and
 * exactly (full hashes logged to the console).
 *
 * Per-project CLONE hashes intentionally don't appear here: clones differ by
 * network seed per project, so they can't be compared across peers anyway —
 * the base provisioned cells are the stable, comparable identity.
 */
import { useEffect, useState } from 'react'
import {
  AppInfo,
  CellType,
  ProvisionedCell,
  encodeHashToBase64,
} from '@holochain/client'
import { getAppWs } from './hcWebsockets'

/** role name -> base64 DNA hash of the role's PROVISIONED (base) cell */
export function getBaseDnaHashes(appInfo: AppInfo): Record<string, string> {
  const hashes: Record<string, string> = {}
  for (const [role, cells] of Object.entries(appInfo.cell_info || {})) {
    const provisioned = (cells || []).find(
      (cellInfo) => cellInfo.type === CellType.Provisioned
    )
    if (provisioned) {
      hashes[role] = encodeHashToBase64(
        (provisioned.value as ProvisionedCell).cell_id[0]
      )
    }
  }
  return hashes
}

/** enough of a b64 hash to compare two installs by eye */
export function shortDnaHash(b64: string): string {
  return `${b64.slice(0, 10)}…${b64.slice(-4)}`
}

/** role -> base DNA hash, fetched once; {} until loaded / on failure */
export function useBaseDnaHashes(): Record<string, string> {
  const [hashes, setHashes] = useState<Record<string, string>>({})
  useEffect(() => {
    let cancelled = false
    getAppWs()
      .then((appWs) => appWs.appInfo())
      .then((appInfo) => {
        if (!appInfo || cancelled) return
        const baseDnas = getBaseDnaHashes(appInfo)
        // the full, copyable hashes for support / exact comparison
        console.log('[acorn] base DNA hashes (provisioned cells):', baseDnas)
        setHashes(baseDnas)
      })
      .catch((e) => console.warn('[acorn] could not read base DNA hashes', e))
    return () => {
      cancelled = true
    }
  }, [])
  return hashes
}
