import React, { useState } from 'react'
import { useSelector, useStore } from 'react-redux'

import './DraftReviewPanel.scss'
import { RootState } from '../../redux/reducer'
import {
  effectiveDiff,
  enumerateChanges,
  isAccepted,
  ChangeRow,
} from '../../redux/ephemeral/draft/changes'
import { diffStats } from '../../migrating/projectDiff'
import {
  setChangeDecision,
  updateDraftEntry,
} from '../../redux/ephemeral/draft/actions'
import {
  confirmDraft,
  exitDraftReview,
  refreshDraftGlow,
} from '../diffReview/draftReview'
import OutcomeFieldsEditor from '../OutcomeFieldsEditor/OutcomeFieldsEditor'
import { outcomeFieldChanges } from './outcomeDiff'

// The draft review panel — the human gate over an LLM-proposed draft (clarity-tree
// draft pipeline). Proposed edits glow on the map as an inert overlay; here the
// human reviews a PR-style field-level diff, accepts/rejects each change, and
// optionally edits it. Confirm (L4) commits the surviving subset; Discard drops
// everything. NOTHING reaches the DHT until Confirm.
const opSymbol: Record<ChangeRow['op'], string> = {
  added: '+',
  updated: '~',
  removed: '−',
}
const opWord: Record<ChangeRow['op'], string> = {
  added: 'New',
  updated: 'Edit',
  removed: 'Remove',
}

const DraftReviewPanel: React.FC = () => {
  const store = useStore()
  const draft = useSelector((s: RootState) => s.ui.draft)
  const activeProject = useSelector((s: RootState) => s.ui.activeProject)
  const liveOutcomes = useSelector(
    (s: RootState) => s.projects.outcomes[activeProject] || {}
  )
  const [editing, setEditing] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!draft.diff || draft.projectId !== activeProject) return null

  const rows = enumerateChanges(draft.diff)
  const outcomeRows = rows.filter((r) => r.collection === 'outcomes')
  const otherRows = rows.filter((r) => r.collection !== 'outcomes')
  const effective = effectiveDiff(draft.diff, draft.decisions)
  const stats = diffStats(effective)
  const totalOut = stats.outcomes
  const nothingAccepted = (Object.keys(stats) as Array<keyof typeof stats>).every(
    (k) => !stats[k].added && !stats[k].updated && !stats[k].removed
  )

  const toggle = (row: ChangeRow, accepted: boolean) => {
    store.dispatch(setChangeDecision(row.key, accepted))
    refreshDraftGlow(store, activeProject)
  }
  const patchEntry = (row: ChangeRow, patch: Record<string, any>) => {
    store.dispatch(
      updateDraftEntry(row.collection, row.op, row.hash, { ...row.entry, ...patch })
    )
    refreshDraftGlow(store, activeProject)
  }

  // committed value of an outcome row (for the before-side of the diff)
  const committed = (row: ChangeRow) => liveOutcomes[row.hash] || null
  const nameOf = (row: ChangeRow): string => {
    if (row.op === 'removed') return committed(row)?.content || row.hash.slice(0, 8) + '…'
    return row.entry?.content || committed(row)?.content || '(untitled)'
  }
  // resolve a node name for connection endpoints (committed or proposed-added)
  const resolveName = (hash: string): string =>
    liveOutcomes[hash]?.content ||
    draft.diff!.outcomes.added[hash]?.content ||
    hash.slice(0, 8) + '…'
  const otherLabel = (row: ChangeRow): string => {
    if (row.collection === 'connections') {
      const c = row.entry || {}
      if (row.op === 'removed') return 'connection removed'
      return `${resolveName(c.parentActionHash)} → ${resolveName(c.childActionHash)}`
    }
    return `${row.collection} ${row.hash.slice(0, 8)}…`
  }

  const onConfirm = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const res = await confirmDraft(store, activeProject)
      if (res.ok === false) setError(res.error)
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="draft-review-panel">
      <div className="draft-review-header">
        <span className="draft-review-title">Proposed changes</span>
        <span className="draft-review-subtitle">review before confirming</span>
      </div>

      <div className="draft-review-summary">
        <span className="draft-review-count">
          {totalOut.added + totalOut.updated + totalOut.removed} node change(s)
        </span>
        <span className="chip added">+{totalOut.added}</span>
        <span className="chip updated">~{totalOut.updated}</span>
        <span className="chip removed">−{totalOut.removed}</span>
      </div>

      <div className="draft-review-changes">
        {outcomeRows.map((row) => {
          const accepted = isAccepted(draft.decisions, row.key)
          const isEditing = editing === row.key
          const changes =
            row.op === 'removed'
              ? []
              : outcomeFieldChanges(committed(row), row.entry)
          return (
            <div
              className={`draft-card ${accepted ? '' : 'rejected'} op-${row.op}`}
              key={row.key}
            >
              <div className="draft-card-head">
                <span className={`draft-card-op ${row.op}`}>{opWord[row.op]}</span>
                <span className="draft-card-name" title={nameOf(row)}>
                  {nameOf(row)}
                </span>
                {row.op !== 'removed' && (
                  <button
                    className="draft-card-editbtn"
                    onClick={() => setEditing(isEditing ? null : row.key)}
                  >
                    {isEditing ? 'done' : 'edit'}
                  </button>
                )}
                <label className="draft-card-accept" title="include this change">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => toggle(row, e.target.checked)}
                  />
                </label>
              </div>

              {/* PR-style field diff */}
              {!isEditing && row.op !== 'removed' && (
                <div className="draft-card-diff">
                  {changes.length === 0 ? (
                    <div className="draft-diff-none">no field-level changes</div>
                  ) : (
                    changes.map((c, i) => (
                      <div className="draft-diff-field" key={i}>
                        <div className="draft-diff-label">{c.label}</div>
                        {c.before !== '' && (
                          <div className="draft-diff-line before">
                            <span className="gutter">−</span>
                            <span className="text">{c.before}</span>
                          </div>
                        )}
                        {c.after !== '' && (
                          <div className="draft-diff-line after">
                            <span className="gutter">+</span>
                            <span className="text">{c.after}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {!isEditing && row.op === 'removed' && (
                <div className="draft-card-diff">
                  <div className="draft-diff-line before">
                    <span className="gutter">−</span>
                    <span className="text">this node will be removed</span>
                  </div>
                </div>
              )}

              {/* inline edit writes back into the draft (never the live node) */}
              {isEditing && (
                <div className="draft-card-editor">
                  <input
                    className="draft-card-content"
                    value={row.entry?.content || ''}
                    placeholder="Outcome name"
                    onChange={(e) => patchEntry(row, { content: e.target.value })}
                  />
                  <OutcomeFieldsEditor
                    description={row.entry?.description || ''}
                    onChange={(description) => patchEntry(row, { description })}
                    isBeingEditedByOther={false}
                    personEditing={null as any}
                    onFieldBlur={() => {}}
                    onFieldFocus={() => {}}
                  />
                </div>
              )}
            </div>
          )
        })}

        {otherRows.length > 0 && (
          <div className="draft-other">
            <div className="draft-other-title">Structure</div>
            {otherRows.map((row) => {
              const accepted = isAccepted(draft.decisions, row.key)
              return (
                <div
                  className={`draft-other-row ${accepted ? '' : 'rejected'}`}
                  key={row.key}
                >
                  <span className={`draft-card-op ${row.op}`}>
                    {opSymbol[row.op]}
                  </span>
                  <span className="draft-other-label" title={otherLabel(row)}>
                    {otherLabel(row)}
                  </span>
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => toggle(row, e.target.checked)}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {error && <div className="draft-review-error">{error}</div>}

      <div className="draft-review-actions">
        <button
          className="draft-review-button discard"
          disabled={busy}
          onClick={() => exitDraftReview(store)}
        >
          Discard
        </button>
        <button
          className="draft-review-button confirm"
          disabled={busy || nothingAccepted}
          onClick={onConfirm}
        >
          {busy ? 'Committing…' : 'Confirm'}
        </button>
      </div>
    </div>
  )
}

export default DraftReviewPanel
