import React from 'react'
import { useSelector, useStore } from 'react-redux'

import './DraftReviewPanel.scss'
import { RootState } from '../../redux/reducer'
import { activeEffectiveDiff } from '../../redux/ephemeral/draft/changes'
import { diffStats } from '../../migrating/projectDiff'
import { exitDraftReview } from '../diffReview/draftReview'

// The draft review panel — visible whenever an LLM-proposed draft is open for the
// active project (clarity-tree draft pipeline). It is the human gate: the proposed
// edits glow on the map as an overlay and stay inert here until Confirm (L4).
// Discard drops them with no DHT write.
//
// Phase 1 (L2) shows the proposed-change summary + Discard. Per-change
// accept/reject + inline edit (L3) and Confirm (L4) extend this panel.
const DraftReviewPanel: React.FC = () => {
  const store = useStore()
  const draft = useSelector((s: RootState) => s.ui.draft)
  const activeProject = useSelector((s: RootState) => s.ui.activeProject)

  const effective = activeEffectiveDiff(draft, activeProject)
  if (!effective) return null

  const stats = diffStats(effective)
  const lines = (Object.keys(stats) as Array<keyof typeof stats>).filter(
    (k) => stats[k].added || stats[k].updated || stats[k].removed
  )

  return (
    <div className="draft-review-panel">
      <div className="draft-review-header">
        <span className="draft-review-title">Proposed changes</span>
        <span className="draft-review-subtitle">review before confirming</span>
      </div>
      <div className="draft-review-summary">
        {lines.length === 0 ? (
          <div className="draft-review-empty">
            No changes selected — every proposed edit was rejected.
          </div>
        ) : (
          lines.map((k) => (
            <div className="draft-review-line" key={k}>
              <span className="draft-review-collection">{k}</span>
              <span className="chip added">+{stats[k].added}</span>
              <span className="chip updated">~{stats[k].updated}</span>
              <span className="chip removed">−{stats[k].removed}</span>
            </div>
          ))
        )}
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
