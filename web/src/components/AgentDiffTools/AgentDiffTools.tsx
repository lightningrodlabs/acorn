import React, { useRef, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useStore } from 'react-redux'

import './AgentDiffTools.scss'
import Icon from '../Icon/Icon'
import { CellIdString } from '../../types/shared'
import { collectExportProjectData } from '../../migrating/export'
import {
  computeProjectDiff,
  isEmptyDiff,
  diffStats,
  findUnresolvedReferences,
  perOutcomeChangeStats,
  OutcomeChangeStatsMap,
  ProjectDiff,
  ProjectSnapshot,
} from '../../migrating/projectDiff'
import { applyProjectDiffToCell } from '../../migrating/applyProjectDiff'
import {
  setChangedOutcomes,
  unselectAll,
} from '../../redux/ephemeral/selection/actions'
import { fitToChanged } from '../diffReview/fitToChanged'

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
  // i3b — outcome-level counts of the last applied diff, rendered as +/~/− chips.
  // Outcomes are the unit a human thinks in; the per-collection detail stays in
  // the status text. Deletions only surface here — removed nodes can't glow.
  const [badge, setBadge] = useState<{
    added: number
    updated: number
    removed: number
  } | null>(null)
  const [busy, setBusy] = useState(false)

  if (!projectId) return null

  const projectName = (): string =>
    store.getState().projects.projectMeta[projectId]?.name || projectId
  // Export writes the full-tree baseline (-tree.json, the agent reads it to know
  // current state) + the diff since last export (-diff.json, so the agent sees
  // what the human changed). Apply reads a SEPARATE -apply.json (the agent's
  // handed changes) so the agent's diffs never corrupt the export baseline.
  const treeName = (): string => `${sanitize(projectName())}-tree.json`
  const diffName = (): string => `${sanitize(projectName())}-diff.json`
  const applyName = (): string => `${sanitize(projectName())}-apply.json`
  const currentSnapshot = (): ProjectSnapshot =>
    collectExportProjectData(store.getState(), projectId) as ProjectSnapshot

  const onExportTree = async () => {
    const current = currentSnapshot()
    setBadge(null)
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
      // i3b — per-node +/~/− counts, computed against the pre-apply snapshot
      // (keyed by diff hashes, remapped below to post-apply live hashes)
      const stats = perOutcomeChangeStats(diff, current)
      const result = await applyProjectDiffToCell(diff, projectId, store.dispatch)
      const liveStats: OutcomeChangeStatsMap = {}
      for (const hash of Object.keys(stats)) {
        liveStats[result.outcomeHashMap[hash] ?? hash] = stats[hash]
      }
      // glow + badge every node with stats — this includes parents of removed
      // nodes, which touchedOutcomes alone misses (nothing left to highlight)
      const touched = [
        ...new Set([...result.touchedOutcomes, ...Object.keys(liveStats)]),
      ]
      // deselect everything and glow the changed nodes (i3a). Clicking the
      // background (unselectAll) clears the glow / exits diff-review mode.
      store.dispatch(unselectAll())
      store.dispatch(setChangedOutcomes(touched, liveStats))
      // i3c — fit the view to all changed nodes once the layout animation settles
      setTimeout(() => fitToChanged(store, touched), 800)
      setBadge(diffStats(diff).outcomes)
      setStatus(`Applied. Lit up ${touched.length} node(s).\n${summary(diff)}`)
    } finally {
      setBusy(false)
    }
  }

  const onApplyClick = async () => {
    if (busy) return
    const data = await bridgeRead(applyName())
    if (data && data.__missing) {
      setStatus(`No agent changes to apply yet (no ${applyName()}).`)
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
      {/* the loop reads as a conversation with the LLM: send it the tree
          (export) and receive its changes back (import) */}
      <div className="agent-llm-area">
        <span className="agent-llm-label">LLM:</span>
        <Icon
          name="export.svg"
          size="small"
          className="agent-llm-icon"
          withTooltipTop
          tooltipText="export tree diff"
          onClick={onExportTree}
        />
        <Icon
          name="import.svg"
          size="small"
          className="agent-llm-icon"
          withTooltipTop
          tooltipText={busy ? 'applying…' : 'import changes diff'}
          onClick={onApplyClick}
        />
      </div>
      {status && (
        <div className="agent-diff-status">
          <button
            className="agent-diff-status-close"
            aria-label="Dismiss"
            onClick={() => {
              setStatus('')
              setBadge(null)
            }}
          >
            ×
          </button>
          {badge && (
            <div className="agent-diff-badge">
              <span className="chip added">+{badge.added}</span>
              <span className="chip updated">~{badge.updated}</span>
              <span className="chip removed">−{badge.removed}</span>
            </div>
          )}
          {status}
        </div>
      )}
    </div>
  )
}

export default AgentDiffTools
