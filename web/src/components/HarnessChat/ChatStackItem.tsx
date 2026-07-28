import React, { useLayoutEffect, useRef, useState } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import { LiveSession } from '../../harness/sessionRegistry'
import { ChatMessage } from '../../harness/chatHistory'
import { BusyBanner, STALL_SECS, TranscriptMessages } from './ChatTranscript'

// One chat in the always-visible stack (multi-chat-panes leaf). Every chat the
// project holds IS an item here — there is no separate picker and no privileged
// "primary" chat. Collapsed, an item is its own history row (title, time, live
// dot); expanded, it is a full live chat bound to its session-registry entry:
// its own transcript, input, busy state, and a Stop that cancels ONLY this
// session. Collapsing never touches the session — a running turn keeps
// streaming into the registry and the transcript is all there on re-expand.
// The ⋯ menu carries the per-chat acts: attach-to-tree, move to another
// agent, and Archive (never delete here — deleting lives in the header's
// archive view, behind the archive step).

export interface ChatRowMenu {
  /** attach this chat's conversation to the tree (current agent's chats only) */
  onAttach?: () => void
  onArchive: () => void
  /** archiving mid-turn is blocked — finish or Stop first */
  archiveDisabled: boolean
  moveTargets: string[]
  onMove: (toAgent: string) => void
  prettyAgent: (agent: string) => string
}

interface Props {
  title: string
  /** compact "5m ago" label shown while collapsed */
  timeLabel: string
  /** owning agent's display label when it is NOT the attached backend */
  agentLabel: string | null
  /** a foreign agent's chat — readable, never writable here */
  readOnly: boolean
  /** the live registry entry, when this session has been resumed */
  entry?: LiveSession
  /** stored transcript fallback when there is no live entry */
  storedMessages: ChatMessage[]
  expanded: boolean
  /** input is enabled: connected, live entry, and writable */
  canSend: boolean
  onToggleExpand: () => void
  onSend: (text: string) => void
  onKeyboard: (own: boolean) => void
  /** the human touched this chat — feeds last-interacted tool routing */
  onInteract: () => void
  menu: ChatRowMenu
}

const ChatStackItem: React.FC<Props> = ({
  title,
  timeLabel,
  agentLabel,
  readOnly,
  entry,
  storedMessages,
  expanded,
  canSend,
  onToggleExpand,
  onSend,
  onKeyboard,
  onInteract,
  menu,
}) => {
  const [input, setInput] = useState('')
  // per-item expanded "Thinking" toggles — message ids are per-session
  const [openThinking, setOpenThinking] = useState<Set<number>>(new Set())
  const toggleThinking = (id: number) =>
    setOpenThinking((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  // the ⋯ menu (and its move submenu)
  const [menuOpen, setMenuOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(menuRef, () => {
    setMenuOpen(false)
    setMoveOpen(false)
  })

  const messages = entry ? entry.messages : storedMessages
  const busy = !!(entry && entry.busy)
  const plan = entry ? entry.plan : []
  const idleSecs = busy
    ? Math.max(0, Math.floor((Date.now() - entry!.activityAt) / 1000))
    : 0

  // Auto-scroll: stick to the bottom unless the user has scrolled up.
  const scrollRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)
  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
  }
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && atBottomRef.current) el.scrollTop = el.scrollHeight
  }, [messages, plan, expanded])

  const send = () => {
    const text = input.trim()
    if (!text || busy || !canSend) return
    setInput('')
    onSend(text)
  }

  const closeMenu = () => {
    setMenuOpen(false)
    setMoveOpen(false)
  }

  return (
    <section
      className={`chat-stack-item${expanded ? '' : ' collapsed'}${
        readOnly ? ' readonly' : ''
      }`}
    >
      <header className="chat-item-head">
        <button
          className="chat-item-collapse"
          aria-label={expanded ? 'Collapse chat' : 'Expand chat'}
          title={expanded ? 'Collapse' : 'Expand'}
          onClick={onToggleExpand}
        >
          {expanded ? '▾' : '▸'}
        </button>
        <span
          className="chat-item-title"
          title={title}
          onClick={onToggleExpand}
        >
          {busy && (
            <span
              className={`chat-live ${
                idleSecs >= STALL_SECS ? 'stalled' : 'running'
              }`}
              title={
                idleSecs >= STALL_SECS
                  ? 'no updates for a while — possibly stalled'
                  : 'turn in progress'
              }
            >
              ●{' '}
            </span>
          )}
          {title}
        </span>
        {agentLabel && (
          <span
            className="chat-item-agent"
            title={`This chat belongs to ${agentLabel}${
              readOnly ? ' — read-only here' : ''
            }`}
          >
            {agentLabel}
          </span>
        )}
        {!expanded && <span className="chat-item-time">{timeLabel}</span>}
        <div className="chat-item-menu-wrap" ref={menuRef}>
          <button
            className="chat-item-menu-btn"
            aria-label="Chat actions"
            title="Chat actions"
            onClick={() => setMenuOpen((s) => !s)}
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="chat-item-menu">
              {menu.onAttach && (
                <button
                  onClick={() => {
                    closeMenu()
                    menu.onAttach!()
                  }}
                >
                  ⎘ Attach conversation to tree
                </button>
              )}
              {menu.moveTargets.length > 0 && (
                <>
                  <button onClick={() => setMoveOpen((s) => !s)}>
                    ⤳ Move to another agent…
                  </button>
                  {moveOpen &&
                    menu.moveTargets.map((a) => (
                      <button
                        key={a}
                        className="chat-item-menu-sub"
                        onClick={() => {
                          closeMenu()
                          menu.onMove(a)
                        }}
                      >
                        → {menu.prettyAgent(a)}
                      </button>
                    ))}
                </>
              )}
              <button
                disabled={menu.archiveDisabled}
                title={
                  menu.archiveDisabled
                    ? 'A turn is in flight — Stop it or let it finish first'
                    : 'Move to the archive (restorable from the header)'
                }
                onClick={() => {
                  closeMenu()
                  menu.onArchive()
                }}
              >
                🗂 Archive chat
              </button>
            </div>
          )}
        </div>
      </header>
      {expanded && (
        <>
          <div
            className="chat-item-transcript"
            ref={scrollRef}
            onScroll={onScroll}
          >
            <TranscriptMessages
              messages={messages}
              busy={busy}
              plan={plan}
              openThinking={openThinking}
              onToggleThinking={toggleThinking}
            />
          </div>
          {busy && (
            <BusyBanner activity={entry!.activity} idleSecs={idleSecs} />
          )}
          {readOnly ? (
            <div className="chat-item-readonly-note">
              Read-only — this chat belongs to {agentLabel} and can't be
              continued here.
            </div>
          ) : (
            <div className="chat-item-input">
              <textarea
                value={input}
                placeholder={
                  canSend
                    ? 'Message this chat…'
                    : 'Harness unreachable — reconnect to chat'
                }
                disabled={!canSend}
                onFocus={() => {
                  onKeyboard(true)
                  onInteract()
                }}
                onBlur={() => onKeyboard(false)}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
              />
              {busy ? (
                <button onClick={() => entry!.session.cancel()}>Stop</button>
              ) : (
                <button onClick={send} disabled={!canSend || !input.trim()}>
                  Send
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default ChatStackItem
