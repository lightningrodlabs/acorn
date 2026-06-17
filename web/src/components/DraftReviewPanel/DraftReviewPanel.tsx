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
import { exitDraftReview, refreshDraftGlow } from '../diffReview/draftReview'
import OutcomeFieldsEditor from '../OutcomeFieldsEditor/OutcomeFieldsEditor'

// The draft review panel — the human gate over an LLM-proposed draft (clarity-tree
// draft pipeline). Proposed edits glow on the map as an inert overlay; here the
// human accepts/rejects and inline-edits each change (L3). Confirm (L4) commits the
// surviving subset; Discard drops everything with no DHT write.
const opSymbol: Record<ChangeRow['op'], string> = {
  added: '+',
  updated: '~',
  removed: '−',
}

const DraftReviewPanel: React.FC = () => {
  const store = useStore()
  const draft = useSelector((s: RootState) => s.ui.draft)
  const activeProject = useSelector((s: RootState) => s.ui.activeProject)
  const liveOutcomes = useSelector(
    (s: RootState) => s.projects.outcomes[activeProject] || {}
  )
  const [expanded, setExpanded] = useState<string | null>(null)

  // only show for an open draft scoped to the project on screen
  if (!draft.diff || draft.projectId !== activeProject) return null

  const rows = enumerateChanges(draft.diff)
  const effective = effectiveDiff(draft.diff, draft.decisions)
  const stats = diffStats(effective)
  const summaryLines = (Object.keys(stats) as Array<keyof typeof stats>).filter(
    (k) => stats[k].added || stats[k].updated || stats[k].removed
  )

  // a human label for a change row
  const labelFor = (row: ChangeRow): string => {
    if (row.collection === 'outcomes') {
      if (row.op === 'removed')
        return liveOutcomes[row.hash]?.content || row.hash.slice(0, 8) + '…'
      return row.entry?.content || '(untitled)'
    }
    return `${row.collection} ${row.hash.slice(0, 8)}…`
  }

  const toggle = (row: ChangeRow, accepted: boolean) => {
    store.dispatch(setChangeDecision(row.key, accepted))
    refreshDraftGlow(store, activeProject)
  }

  // inline-edit a proposed outcome (its content/name and its typed fields),
  // writing back into the draft diff entry — never the live outcome
  const patchEntry = (row: ChangeRow, patch: Record<string, any>) => {
    store.dispatch(
      updateDraftEntry(row.collection, row.op, row.hash, { ...row.entry, ...patch })
    )
    refreshDraftGlow(store, activeProject)
  }

  const editableOutcome = (row: ChangeRow) =>
    row.collection === 'outcomes' && row.op !== 'removed'

  return (
    <div className="draft-review-panel">
      <div className="draft-review-header">
        <span className="draft-review-title">Proposed changes</span>
        <span className="draft-review-subtitle">review before confirming</span>
      </div>

      <div className="draft-review-summary">
        {summaryLines.length === 0 ? (
          <div className="draft-review-empty">
            Nothing selected — every change is rejected.
          </div>
        ) : (
          summaryLines.map((k) => (
            <div className="draft-review-line" key={k}>
              <span className="draft-review-collection">{k}</span>
              <span className="chip added">+{stats[k].added}</span>
              <span className="chip updated">~{stats[k].updated}</span>
              <span className="chip removed">−{stats[k].removed}</span>
            </div>
          ))
        )}
      </div>

      <div className="draft-review-changes">
        {rows.map((row) => {
          const accepted = isAccepted(draft.decisions, row.key)
          const isOpen = expanded === row.key
          return (
            <div
              className={`draft-change ${accepted ? '' : 'rejected'} op-${row.op}`}
              key={row.key}
            >
              <div className="draft-change-row">
                <span className={`draft-change-op ${row.op}`}>
                  {opSymbol[row.op]}
                </span>
                <span className="draft-change-label" title={labelFor(row)}>
                  {labelFor(row)}
                </span>
                {editableOutcome(row) && (
                  <button
                    className="draft-change-edit"
                    onClick={() => setExpanded(isOpen ? null : row.key)}
                  >
                    {isOpen ? 'done' : 'edit'}
                  </button>
                )}
                <input
                  type="checkbox"
                  className="draft-change-accept"
                  title={accepted ? 'reject this change' : 'accept this change'}
                  checked={accepted}
                  onChange={(e) => toggle(row, e.target.checked)}
                />
              </div>
              {isOpen && editableOutcome(row) && (
                <div className="draft-change-editor">
                  <input
                    className="draft-change-content"
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
      </div>

      <div className="draft-review-actions">
        <button
          className="draft-review-button discard"
          onClick={() => exitDraftReview(store)}
        >
          Discard
        </button>
      </div>
    </div>
  )
}

export default DraftReviewPanel
