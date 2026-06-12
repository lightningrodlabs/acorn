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
  ProjectDiff,
  ProjectSnapshot,
} from '../../migrating/projectDiff'
import { applyProjectDiffToCell } from '../../migrating/applyProjectDiff'
import {
  selectOutcome,
  unselectAll,
} from '../../redux/ephemeral/selection/actions'

// Temporary floating tools (sits with "Report Issue" / the eye button) for the
// low-friction LLM-agent diff loop — branch I. To be folded into the AI chat
// panel (branch F) later.
//
// Export tree: download the current project's live tree to edit.
// Apply update: pick an edited tree (or a ProjectDiff), apply only the delta onto
//   THIS project in place, and light up the touched nodes.

const SNAPSHOT_KEY = (projectId: string) => `acorn:lastDiffSnapshot:${projectId}`

const EMPTY_SNAPSHOT: ProjectSnapshot = {
  outcomes: {},
  connections: {},
  tags: {},
  outcomeMembers: {},
  outcomeComments: {},
  entryPoints: {},
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

  const currentSnapshot = (): ProjectSnapshot =>
    collectExportProjectData(store.getState(), projectId) as ProjectSnapshot

  const onExportTree = () => {
    const current = currentSnapshot()
    localStorage.setItem(SNAPSHOT_KEY(projectId), JSON.stringify(current))
    const name = store.getState().projects.projectMeta[projectId]?.name || 'project'
    download(`${name.replace(/\s+/g, '-').toLowerCase()}-tree.json`, current)
    setStatus('Exported current tree (snapshot saved). Edit it and use "Apply update".')
  }

  const onApplyFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    try {
      const incoming = JSON.parse(await file.text())
      const current = currentSnapshot()
      // a ProjectDiff applies directly; a full tree is diffed against current
      const diff: ProjectDiff = isProjectDiff(incoming)
        ? incoming
        : computeProjectDiff(current, incoming)

      if (isEmptyDiff(diff)) {
        setStatus('No changes to apply — the file matches the current tree.')
        return
      }
      if (!window.confirm(`Apply this update to the current project?\n\n${summary(diff)}`)) {
        setStatus('Apply cancelled.')
        return
      }
      setBusy(true)
      setStatus('Applying update…')
      const result = await applyProjectDiffToCell(diff, projectId, store.dispatch)
      // light up the touched nodes by selecting them
      store.dispatch(unselectAll())
      result.touchedOutcomes.forEach((hash) => store.dispatch(selectOutcome(hash)))
      setStatus(
        `Applied. Lit up ${result.touchedOutcomes.length} node(s).\n${summary(diff)}`
      )
    } catch (err: any) {
      console.error('[AgentDiffTools] apply failed', err)
      setStatus(`Apply failed: ${err?.message || err}`)
    } finally {
      setBusy(false)
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
        onClick={() => !busy && fileInput.current?.click()}
      />
      {status && <div className="agent-diff-status">{status}</div>}
    </div>
  )
}

export default AgentDiffTools
