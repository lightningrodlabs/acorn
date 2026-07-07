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
import { enterDraftReview } from '../diffReview/draftReview'
import { askDirectory, askConfirm } from '../AskDialog/AskDialog'

// Temporary floating tools (sits with "Report Issue" / the eye button) for the
// low-friction LLM-agent diff loop — branch I. Folds into the AI chat panel later.
//
// In dev, Export/Apply hit a tiny dev-server bridge that reads/writes deterministic
// exchange files (the renderer can't touch the filesystem directly — no Node, and
// the File System Access API is blocked in the dev iframe context). The agent edits
// those exact files in place. The files live NEXT TO the originally imported tree
// file when the project was imported (located via the bridge by the file name
// recorded at import), so a reboot doesn't wipe them the way tmpfs does; for a
// project born in Acorn, a one-time prompt asks where they should go, and the
// answer is remembered per project. Outside dev (no bridge) it falls back to a
// browser download + file picker, with no prompt.

const SNAPSHOT_KEY = (projectId: string) => `acorn:lastDiffSnapshot:${projectId}`
// per-project directory the exchange files live in (resolved once, remembered)
const EXCHANGE_DIR_KEY = (projectId: string) => `acorn:exchangeDir:${projectId}`
// {name, path?} of the originally imported file (written by ImportProjectModal)
const IMPORT_SOURCE_KEY = (projectId: string) => `acorn:importSource:${projectId}`

const sanitize = (name: string): string =>
  name.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'tree'

const bridgeUrl = (name: string, dir?: string) =>
  `/__acorn_diff/${encodeURIComponent(name)}` +
  (dir ? `?dir=${encodeURIComponent(dir)}` : '')
const isJson = (res: Response) =>
  (res.headers.get('content-type') || '').includes('application/json')

// Whether the dev bridge exists at all (a production build has none), so the
// fallback path never bothers the user with prompts. Probes the diff endpoint
// itself — it answers JSON whether or not the file exists (404 {error} when
// missing), while a bridgeless build serves HTML (SPA fallback) or errors.
async function bridgeAlive(): Promise<boolean> {
  try {
    const res = await fetch(bridgeUrl('__probe__.json'))
    return isJson(res)
  } catch {
    return false
  }
}

// Ask the bridge to find a file by basename under the repo root. Returns the
// absolute paths of matches (empty when none / ambiguous handling is the caller's).
async function bridgeLocate(name: string): Promise<string[]> {
  try {
    const res = await fetch(`/__acorn_diff_locate?name=${encodeURIComponent(name)}`)
    if (!res.ok || !isJson(res)) return []
    const j = await res.json()
    return Array.isArray(j.matches) ? j.matches : []
  } catch {
    return []
  }
}

// Read the exchange file via the dev bridge. Returns the parsed tree, the marker
// {__missing:true} if the bridge is up but the file isn't there yet, or null if
// there is no bridge (e.g. a production build).
async function bridgeRead(name: string, dir?: string): Promise<any | null> {
  try {
    const res = await fetch(bridgeUrl(name, dir))
    if (res.status === 404 && isJson(res)) return { __missing: true }
    if (res.ok && isJson(res)) return await res.json()
    return null
  } catch {
    return null
  }
}

// Write via the dev bridge; returns the on-disk path, or null if no bridge.
async function bridgeWrite(
  name: string,
  data: object,
  dir?: string
): Promise<string | null> {
  try {
    const res = await fetch(bridgeUrl(name, dir), {
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
  const draftInput = useRef<HTMLInputElement>(null)
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
  // a ProjectDiff to open as a draft overlay (review, not apply) — dev affordance
  // to verify the draft pipeline (L2) end-to-end with no agent
  const draftName = (): string => `${sanitize(projectName())}-draft.json`
  const currentSnapshot = (): ProjectSnapshot =>
    collectExportProjectData(store.getState(), projectId) as ProjectSnapshot

  // Where this project's exchange files live (assumes the bridge is up — callers
  // check bridgeAlive() first). Resolution order, cached in localStorage:
  //   1. the remembered per-project directory
  //   2. an imported tree: the directory of the original file — by its recorded
  //      absolute path (Electron) or located by name via the bridge (dev iframe)
  //   3. a one-time prompt (project born in Acorn, or the original wasn't found)
  // Returns null only when the user cancels the prompt.
  const resolveExchangeDir = async (): Promise<string | null> => {
    const stored = localStorage.getItem(EXCHANGE_DIR_KEY(projectId))
    if (stored) return stored
    const remember = (dir: string) => {
      localStorage.setItem(EXCHANGE_DIR_KEY(projectId), dir)
      return dir
    }
    const rawSrc = localStorage.getItem(IMPORT_SOURCE_KEY(projectId))
    if (rawSrc) {
      try {
        const src = JSON.parse(rawSrc)
        if (typeof src.path === 'string' && src.path.includes('/')) {
          return remember(src.path.slice(0, src.path.lastIndexOf('/')) || '/')
        }
        if (typeof src.name === 'string' && src.name) {
          const matches = await bridgeLocate(src.name)
          // only trust an unambiguous hit; 0 or many falls through to the prompt
          if (matches.length === 1) {
            const m = matches[0]
            return remember(m.slice(0, m.lastIndexOf('/')) || '/')
          }
        }
      } catch {
        // unparseable provenance — fall through to the prompt
      }
    }
    const dir = await askDirectory({
      heading: 'LLM exchange directory',
      message:
        "Where should this project's LLM exchange files (tree/diff/apply/draft) live?\n" +
        'Pick somewhere durable — /tmp is wiped on reboot.',
      defaultValue: '/tmp/acorn-clarity',
    })
    return dir && dir.trim() ? remember(dir.trim()) : null
  }

  const onExportTree = async () => {
    const current = currentSnapshot()
    setBadge(null)
    localStorage.setItem(SNAPSHOT_KEY(projectId), JSON.stringify(current))
    if (!(await bridgeAlive())) {
      // no dev bridge — fall back to a plain download of the full tree
      download(treeName(), current)
      setStatus('Exported full tree (download). No dev bridge, so no diff file.')
      return
    }
    const dir = await resolveExchangeDir()
    if (!dir) {
      setStatus('Export cancelled — no directory chosen.')
      return
    }
    // read the previous exported tree (the baseline) BEFORE overwriting it
    const prev = await bridgeRead(treeName(), dir)
    const treePath = await bridgeWrite(treeName(), current, dir)
    if (!treePath) {
      setStatus(`Export failed — could not write to ${dir}.`)
      return
    }
    if (prev && !prev.__missing && prev.outcomes) {
      // the export IS a diff: write only what changed since the last export
      const diff = computeProjectDiff(prev, current)
      await bridgeWrite(diffName(), diff, dir)
      const s = summary(diff)
      setStatus(`Exported.\ntree:  ${treePath}\ndiff since last export:${s ? '\n' + s : ' (no changes)'}`)
    } else {
      setStatus(
        `Initial export — baseline saved:\n${treePath}\n` +
          `Changes come back via ${applyName()} in the same folder — ` +
          `click the import (⬇) icon to apply it.`
      )
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
    const confirmed = await askConfirm({
      heading: 'Apply this update?',
      // fenced: the dialog renders markdown, and the summary's +/~/− lines
      // would otherwise collapse into one paragraph (or strike through on ~)
      message: `Apply this update to the current project?\n\n\`\`\`\n${summary(
        diff
      )}\n\`\`\``,
      confirmLabel: 'Apply',
    })
    if (!confirmed) {
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
    if (!(await bridgeAlive())) {
      // no dev bridge — fall back to a file picker
      fileInput.current?.click()
      return
    }
    const dir = await resolveExchangeDir()
    if (!dir) {
      setStatus('Apply cancelled — no directory chosen.')
      return
    }
    const data = await bridgeRead(applyName(), dir)
    if (!data || data.__missing) {
      setStatus(`No agent changes to apply yet (no ${applyName()} in ${dir}).`)
      return
    }
    try {
      await applyData(data)
    } catch (err: any) {
      console.error('[AgentDiffTools] apply failed', err)
      setStatus(`Apply failed: ${err?.message || err}`)
    }
  }

  // Open a ProjectDiff as a draft overlay (review mode) rather than applying it.
  // Reads <name>-draft.json via the dev bridge, falling back to a file picker.
  // Nothing is written to the DHT — the draft is inert until Confirm.
  const onLoadDraftClick = async () => {
    if (busy) return
    if (!(await bridgeAlive())) {
      draftInput.current?.click()
      return
    }
    const dir = await resolveExchangeDir()
    if (!dir) {
      setStatus('Load draft cancelled — no directory chosen.')
      return
    }
    const data = await bridgeRead(draftName(), dir)
    if (!data || data.__missing) {
      setStatus(`No draft to load yet (no ${draftName()} in ${dir}).`)
      return
    }
    if (!isProjectDiff(data)) {
      setStatus(`${draftName()} is not a ProjectDiff.`)
      return
    }
    enterDraftReview(store, data, projectId)
    setStatus(`Draft opened for review.\n${summary(data)}`)
  }

  const onDraftFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      if (!isProjectDiff(parsed)) {
        setStatus('Picked file is not a ProjectDiff.')
        return
      }
      enterDraftReview(store, parsed, projectId)
      setStatus(`Draft opened for review.\n${summary(parsed)}`)
    } catch (err: any) {
      setStatus(`Load draft failed: ${err?.message || err}`)
    }
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
      <input
        ref={draftInput}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={onDraftFilePicked}
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
        <Icon
          name="eye.svg"
          size="small"
          className="agent-llm-icon"
          withTooltipTop
          tooltipText="load draft (review, no commit)"
          onClick={onLoadDraftClick}
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
