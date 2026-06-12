import React, { useRef, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useStore } from 'react-redux'

import './AgentDiffTools.scss'
import Button from '../Button/Button'
import { CellIdString } from '../../types/shared'
import { collectExportProjectData } from '../../migrating/export'
import {
  computeProjectDiff,
  isEmptyDiff,
  diffStats,
  findUnresolvedReferences,
  ProjectDiff,
  ProjectSnapshot,
} from '../../migrating/projectDiff'
import { applyProjectDiffToCell } from '../../migrating/applyProjectDiff'
import {
  setChangedOutcomes,
  unselectAll,
} from '../../redux/ephemeral/selection/actions'

// Temporary floating tools (sits with "Report Issue" / the eye button) for the
// low-friction LLM-agent diff loop — branch I. Folds into the AI chat panel later.
//
// In dev, Export/Apply hit a tiny dev-server bridge that reads/writes a
// deterministic file under <tmp>/acorn-clarity (the renderer can't touch the
// filesystem directly — no Node, and the File System Access API is blocked in the
// dev iframe context). The agent edits that exact file in place. Outside dev (no
// bridge) it falls back to a browser download + file picker.

const SNAPSHOT_KEY = (projectId: string) => `acorn:lastDiffSnapshot:${projectId}`

const sanitize = (name: string): string =>
  name.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'tree'

const bridgeUrl = (name: string) => `/__acorn_diff/${encodeURIComponent(name)}`
const isJson = (res: Response) =>
  (res.headers.get('content-type') || '').includes('application/json')

// Read the exchange file via the dev bridge. Returns the parsed tree, the marker
// {__missing:true} if the bridge is up but the file isn't there yet, or null if
// there is no bridge (e.g. a production build).
async function bridgeRead(name: string): Promise<any | null> {
  try {
    const res = await fetch(bridgeUrl(name))
    if (res.status === 404 && isJson(res)) return { __missing: true }
    if (res.ok && isJson(res)) return await res.json()
    return null
  } catch {
    return null
  }
}

// Write via the dev bridge; returns the on-disk path, or null if no bridge.
async function bridgeWrite(name: string, data: object): Promise<string | null> {
  try {
    const res = await fetch(bridgeUrl(name), {
      method: 'POST',
      body: JSON.stringify(data, null, 2),
    })
    if (!res.ok || !isJson(res)) return null
    const j = await res.json()
    return j && j.ok ? j.path : null
  } catch {
    return null
  }
}

function download(filename: string, data: object) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const isProjectDiff = (data: any): data is ProjectDiff =>
  data && data.outcomes && 'added' in data.outcomes && 'removed' in data.outcomes

const summary = (diff: ProjectDiff): string => {
  const s = diffStats(diff)
  return Object.keys(s)
    .filter((k) => s[k].added || s[k].updated || s[k].removed)
    .map((k) => `${k}: +${s[k].added} ~${s[k].updated} -${s[k].removed}`)
    .join('\n')
}

const AgentDiffTools: React.FC = () => {
  const projectPage = useRouteMatch<{ projectId: CellIdString }>(
    '/project/:projectId'
  )
  const projectId = projectPage ? projectPage.params.projectId : null
  const store = useStore()
  const fileInput = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  if (!projectId) return null

  const projectName = (): string =>
    store.getState().projects.projectMeta[projectId]?.name || projectId
  // the full-tree baseline (what the agent edits + what Apply reads) and the diff
  // since the last export (so the agent sees what changed without searching)
  const treeName = (): string => `${sanitize(projectName())}-tree.json`
  const diffName = (): string => `${sanitize(projectName())}-diff.json`
  const currentSnapshot = (): ProjectSnapshot =>
    collectExportProjectData(store.getState(), projectId) as ProjectSnapshot

  const onExportTree = async () => {
    const current = currentSnapshot()
    localStorage.setItem(SNAPSHOT_KEY(projectId), JSON.stringify(current))
    // read the previous exported tree (the baseline) BEFORE overwriting it
    const prev = await bridgeRead(treeName())
    const treePath = await bridgeWrite(treeName(), current)
    if (!treePath) {
      // no dev bridge — fall back to a plain download of the full tree
      download(treeName(), current)
      setStatus('Exported full tree (download). No dev bridge, so no diff file.')
      return
    }
    if (prev && !prev.__missing && prev.outcomes) {
      // the export IS a diff: write only what changed since the last export
      const diff = computeProjectDiff(prev, current)
      await bridgeWrite(diffName(), diff)
      const s = summary(diff)
      setStatus(`Exported.\ntree:  ${treePath}\ndiff since last export:${s ? '\n' + s : ' (no changes)'}`)
    } else {
      setStatus(`Initial export — baseline saved:\n${treePath}\nEdit it, then "Apply update".`)
    }
  }

  const applyData = async (incoming: any) => {
    const current = currentSnapshot()
    const diff: ProjectDiff = isProjectDiff(incoming)
      ? incoming
      : computeProjectDiff(current, incoming)
    if (isEmptyDiff(diff)) {
      setStatus('No changes to apply — the file matches the current tree.')
      return
    }
    const unresolved = findUnresolvedReferences(diff, current)
    if (unresolved.length) {
      setStatus(
        `Cannot apply — ${unresolved.length} reference(s) point to missing nodes:\n` +
          unresolved.map((h) => h.slice(0, 12) + '…').join(', ')
      )
      return
    }
    if (!window.confirm(`Apply this update to the current project?\n\n${summary(diff)}`)) {
      setStatus('Apply cancelled.')
      return
    }
    setBusy(true)
    setStatus('Applying update…')
    try {
      const result = await applyProjectDiffToCell(diff, projectId, store.dispatch)
      // deselect everything and glow the changed nodes (i3a). Clicking the
      // background (unselectAll) clears the glow / exits diff-review mode.
      store.dispatch(unselectAll())
      store.dispatch(setChangedOutcomes(result.touchedOutcomes))
      setStatus(`Applied. Lit up ${result.touchedOutcomes.length} node(s).\n${summary(diff)}`)
    } finally {
      setBusy(false)
    }
  }

  const onApplyClick = async () => {
    if (busy) return
    const data = await bridgeRead(treeName())
    if (data && data.__missing) {
      setStatus('No exported tree yet — click "Export tree" first.')
      return
    }
    if (data) {
      try {
        await applyData(data)
      } catch (err: any) {
        console.error('[AgentDiffTools] apply failed', err)
        setStatus(`Apply failed: ${err?.message || err}`)
      }
      return
    }
    // no dev bridge — fall back to a file picker
    fileInput.current?.click()
  }

  const onApplyFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      await applyData(JSON.parse(await file.text()))
    } catch (err: any) {
      console.error('[AgentDiffTools] apply failed', err)
      setStatus(`Apply failed: ${err?.message || err}`)
    }
  }

  return (
    <div className="agent-diff-tools">
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={onApplyFilePicked}
      />
      <Button text="Export tree" size="small" className="green" onClick={onExportTree} />
      <Button
        text={busy ? 'Applying…' : 'Apply update'}
        size="small"
        className="green"
        onClick={onApplyClick}
      />
      {status && <div className="agent-diff-status">{status}</div>}
    </div>
  )
}

export default AgentDiffTools
