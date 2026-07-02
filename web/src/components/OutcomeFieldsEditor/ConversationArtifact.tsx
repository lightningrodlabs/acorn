import React, { useState } from 'react'
import { Transcript, anchorSelection } from '../../harness/transcript'

// Read-only rendering of a captured conversation (the 'conversation' artifact
// type): the transcript's turns as a legible thread — role + content — distinct
// from the input/output reference-artifact rows. The agent's plan history (if
// captured) collapses into a small expandable section so it's available without
// crowding the thread.

const roleLabel = (role: string): string =>
  role === 'user' ? 'You' : role === 'agent' ? 'Agent' : 'System'

export type ConversationArtifactProps = {
  label: string
  // null when the artifact is a placeholder (empty uri) or its value isn't a
  // well-formed transcript — rendered as an explicit empty state, not a bare row.
  transcript: Transcript | null
}

const ConversationArtifact: React.FC<ConversationArtifactProps> = ({
  label,
  transcript,
}) => {
  const [openPlan, setOpenPlan] = useState(false)
  if (!transcript || transcript.turns.length === 0) {
    return (
      <div className="conversation-artifact conversation-artifact--empty">
        <div className="conversation-artifact-header">
          <span className="conversation-artifact-title">
            {label || (transcript && transcript.title) || 'Conversation'}
          </span>
        </div>
        <div className="conversation-artifact-emptynote">
          No transcript captured yet — attach a chat session to fill it in.
        </div>
      </div>
    )
  }
  const plans = transcript.planSnapshots || []
  const latestPlan = plans.length ? plans[plans.length - 1] : null
  const anchor = anchorSelection(transcript)

  return (
    <div className="conversation-artifact">
      <div className="conversation-artifact-header">
        <span className="conversation-artifact-title">
          {label || transcript.title || 'Conversation'}
        </span>
        <span className="conversation-artifact-count">
          {transcript.turns.length} turn{transcript.turns.length === 1 ? '' : 's'}
        </span>
      </div>

      {anchor.length > 0 && (
        <div className="conversation-artifact-anchor">
          re: {anchor.map((s) => s.content || s.id).join(', ')}
        </div>
      )}

      <div className="conversation-thread">
        {transcript.turns.map((turn, i) => (
          <div key={i} className={`conversation-turn role-${turn.role}`}>
            <span className="conversation-turn-role">{roleLabel(turn.role)}</span>
            <div className="conversation-turn-body">
              {turn.thinking && (
                <div className="conversation-turn-thinking">{turn.thinking}</div>
              )}
              <div className="conversation-turn-content">{turn.content}</div>
              {(turn.toolCalls || []).length > 0 && (
                <ul className="conversation-turn-tools">
                  {(turn.toolCalls || []).map((tc) => (
                    <li key={tc.id} className={`tool-${tc.status}`}>
                      ⚙ {tc.title} ({tc.status})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {latestPlan && (
        <div className="conversation-plan">
          <button
            type="button"
            className="conversation-plan-toggle"
            onClick={() => setOpenPlan((o) => !o)}
          >
            {openPlan ? '▾' : '▸'} Plan ({plans.length} update
            {plans.length === 1 ? '' : 's'})
          </button>
          {openPlan && (
            <ul className="conversation-plan-entries">
              {latestPlan.entries.map((e, i) => (
                <li key={i} className={`plan-${e.status}`}>
                  {e.content} <em>({e.status})</em>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default ConversationArtifact
