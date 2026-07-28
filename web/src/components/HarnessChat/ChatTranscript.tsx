import React from 'react'
import remarkGfm from 'remark-gfm'
import RichText from '../RichText/RichText'
import { ChatMessage } from '../../harness/chatHistory'
import { HarnessPlanEntry } from '../../harness/types'

// Rendering shared by every live chat view (multi-chat-panes leaf): the primary
// chat and each stacked ChatStackItem show the same transcript, so the message
// list and the busy banner live here instead of being copied per view.

// Seconds without any session/update before we flag a possible stall. ACP has
// no heartbeat, so this is the best signal that the agent has gone quiet.
export const STALL_SECS = 20

/** The message list + the agent's latest plan, for one session's transcript. */
export const TranscriptMessages: React.FC<{
  messages: ChatMessage[]
  busy: boolean
  plan: HarnessPlanEntry[]
  /** agent-message ids whose reasoning block the user has expanded */
  openThinking: Set<number>
  onToggleThinking: (id: number) => void
}> = ({ messages, busy, plan, openThinking, onToggleThinking }) => (
  <>
    {messages.map((m, i) => {
      if (m.role !== 'agent')
        return (
          <div key={m.id} className={`harness-msg ${m.role}`}>
            {/* User messages go through RichText too, so [[handle]] /
                [[123456]] references the human types are clickable —
                system notices (e.g. "↻ sent updated tree") stay plain. */}
            {m.role === 'user' ? (
              <RichText source={m.text} remarkPlugins={[remarkGfm]} />
            ) : (
              m.text
            )}
          </div>
        )
      // The in-flight agent message is the last one while busy — auto-open
      // its reasoning so thinking stays visible live; once done it
      // collapses, reopenable via the toggle (state in openThinking).
      const streaming = busy && i === messages.length - 1
      const open = streaming || openThinking.has(m.id)
      return (
        <React.Fragment key={m.id}>
          {m.thinking && (
            <div className={`harness-msg thought${open ? ' open' : ''}`}>
              <button
                className="thought-toggle"
                onClick={() => onToggleThinking(m.id)}
              >
                {open ? '▾' : '▸'} Thinking
              </button>
              {open && <div className="thought-body">{m.thinking}</div>}
            </div>
          )}
          {(m.text || !streaming) && (
            <div className="harness-msg agent">
              <RichText source={m.text} remarkPlugins={[remarkGfm]} />
            </div>
          )}
        </React.Fragment>
      )
    })}
    {plan.length > 0 && (
      <ul className="harness-plan">
        {plan.map((e, i) => (
          <li key={i} className={`plan-${e.status}`}>
            {e.content}
          </li>
        ))}
      </ul>
    )}
  </>
)

/** The in-flight activity strip: spinner + latest activity, amber on a stall. */
export const BusyBanner: React.FC<{ activity: string; idleSecs: number }> = ({
  activity,
  idleSecs,
}) => (
  <div
    className={`harness-chat-thinking${
      idleSecs >= STALL_SECS ? ' stalled' : ''
    }`}
  >
    <span className="spinner" />
    <span className="label">
      {idleSecs >= STALL_SECS
        ? `No updates for ${idleSecs}s — still working, or stalled. Stop to cancel.`
        : `${activity || 'Thinking…'}${idleSecs >= 3 ? ` (${idleSecs}s)` : ''}`}
    </span>
  </div>
)
