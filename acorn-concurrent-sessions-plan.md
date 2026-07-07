# Plan — concurrent agent sessions in and across trees

## Top-level outcome

> **A human can easily switch between concurrent agent sessions while work is in
> progress, both in one tree and across trees.**

Two pains drive this:

1. **Fear of touching the tree while an agent is working.** The agent reads a
   snapshot at turn start; a human edit made mid-turn is invisible to it, and a
   later `propose_edits` → Confirm replaces outcomes wholesale — so a concurrent
   human edit can be silently stomped. The rational response today is to freeze,
   which serializes all work behind the agent.
2. **One conversation at a time.** The chat panel holds a single active session
   with a single `busy` flag — while a turn streams, the input is disabled and
   switching sessions abandons the streaming view. You cannot flesh out branch B
   with one agent while another agent grinds on branch A.

## What the current architecture already gives us

The transport is *not* the bottleneck — the constraints are all in the renderer.

- **Sidecar multiplexes sessions.** Every frame carries a `sessionId`
  (`web/dev-harness/sidecar.js`, `devSidecarClient.ts`); one agent process holds
  many ACP sessions concurrently, and `resumeSession` already exists. Concurrent
  turns over one WebSocket should mostly work at the protocol layer today.
- **Session history is already per-session.** `chatHistory.ts` stores sessions
  keyed by project + agent with `persistTurn`; the picker lists them. What's
  missing is *live* state for more than one.
- **The single-points-of-serialization are:**
  - `HarnessChat.tsx` — one `sessionRef`, one `busy` boolean, one streaming
    transcript; the whole panel is modal on the in-flight turn.
  - `state.ui.draft` — one diff + one projectId per window
    (`redux/ephemeral/draft/reducer.ts`); a second `propose_edits` replaces or
    merges into the first agent's draft.
  - `askConfirm` / permission handling — a single global modal; two sessions
    asking at once would fight over it.
  - `propose_edits` has no notion of the baseline it was computed against —
    conflicts with concurrent human edits are undetectable by construction.

## Outcome tree (for import into the clarity tree)

```
A human can easily switch between concurrent agent sessions while work is in
progress, both in one tree and across trees
├─ 1. Multiple sessions run turns concurrently in one window, and switching
│     between them never cancels, blocks, or hides a running turn
├─ 2. Editing the live tree while agents work is safe: agent proposals are
│     rebased against the live tree and conflicts are surfaced, never silently
│     overwritten
├─ 3. Each session's proposed draft is reviewed independently; drafts from
│     different sessions coexist without clobbering each other
├─ 4. Things that need the human (permissions, questions, finished drafts,
│     stalls) queue in a per-session attention inbox instead of global modals
├─ 5. A session can be scoped to a region of the tree, and the map shows which
│     agent is working where
└─ 6. Concurrent sessions work across windows and across trees, with shared
      state (chat history, sidecar sessions) safe under concurrency
```

---

### 1. Concurrent sessions in one window *(the "switch freely" unlock)*

**Now:** one `sessionRef`, one `busy`, one in-memory transcript. Sending a
prompt locks the panel until the whole turn resolves.

**Target design:**
- Replace the singletons with a **session registry**: `Map<sessionId, { session,
  busy, streamBuffer, planSnapshot, lastTreeSent }>`. Each open session keeps its
  own `HarnessSession` handle and subscribes to its own updates; updates stream
  into per-session buffers whether or not that session is the one displayed.
- The chat panel becomes a **view over the registry**: switching sessions swaps
  which buffer renders; the background turn keeps streaming and is fully caught
  up when you switch back (persist partial turns via the existing `persistTurn`
  path so even a reload mid-turn recovers via `resumeSession`).
- **Session picker shows live status** per session: ● running / ✋ needs you /
  ✓ idle / ⚠ stalled, plus which subtree it's scoped to (outcome 5). "New
  session" is always available even while others run.
- `lastTreeRef` (snapshot-resend dedup) moves into the registry — it is
  per-session state, not per-panel.

**Completion criteria:**
- With session A mid-turn, I can open session B, send a prompt, get a reply, and
  return to A to find its completed (or still-streaming) output intact.
- Cancelling A never affects B. A renderer reload resumes both.

### 2. Safe concurrent editing of the live tree *(the "stop being afraid" fix)*

**Now:** the agent's snapshot is stamped nowhere; `propose_edits` diffs apply
against whatever the tree is at Confirm time. `remapDiffRefs` and the
conversation-artifact re-graft mitigate specific cases, but a human edit to a
node's content after the agent read it is silently lost on Confirm.

**Target design:**
- **Baseline stamping:** every `read_tree` result carries a monotonic baseline
  id (hash of the canonical snapshot is enough); the session registry remembers
  the last baseline handed to each session; `propose_edits` records the baseline
  its diff was computed against.
- **Rebase on draft-open and again on Confirm:** compute, per node, whether the
  live tree diverged from the baseline *on a field the diff also touches*.
  Three-way merge where trivially safe (agent edited description, human moved
  the node → both apply); where both touched the same field, mark the change
  **conflicted**.
- **Conflicts surface in the review panel**, per change: show baseline → human's
  live version → agent's proposal; default decision for a conflicted change is
  *reject* (human's live edit wins unless explicitly overridden). Never a silent
  overwrite in either direction.
- Turn-start freshness (resend snapshot when changed) already exists; add a
  mid-draft nudge: if the live tree moves under an open draft, the review panel
  shows "tree changed under this draft — N changes rebased, M now conflicted".

**Completion criteria:**
- While an agent works on subtree A, I edit a node in subtree B: Confirm applies
  both cleanly, no dialog needed.
- I edit the *same* node the agent is rewriting: the review panel flags exactly
  that node as conflicted, shows both versions, and my edit survives unless I
  choose the agent's.

### 3. Per-session drafts

**Now:** `DraftState` is `{ diff, projectId, decisions }` — one draft per
window; a second session's `propose_edits` calls `updateDraftReview` and
clobbers/merges into the first.

**Target design:**
- Draft slice becomes `Map<sessionId, { diff, projectId, decisions, baseline }>`
  (baseline from outcome 2). `propose_edits` writes to *its own* session's
  draft; `alreadyOpen` merging only applies within one session.
- Review UI gains a draft selector (or stacks) labeled by session title + agent;
  the map overlay renders the draft you're currently reviewing.
- **Confirm of one draft rebases the others** (they were computed against a tree
  that just changed) — reusing outcome 2's rebase machinery; newly-conflicted
  changes in other drafts get flagged.
- Cross-session overlap (two drafts touching the same node) is detected at
  propose time and shown as a warning badge on both drafts.

**Completion criteria:**
- Sessions A and B each propose edits; both drafts are visible, independently
  reviewable, and confirmable in either order with correct results.

### 4. Attention inbox instead of global modals

**Now:** permission requests and agent questions land in one global
`askConfirm`/AskDialog; a request from a background session would interrupt
whatever you're looking at — or collide with another session's dialog.

**Target design:**
- Pending permission requests, agent questions, stall warnings, and
  "draft ready for review" become **attention items** attributed to a session,
  held in a queue (they're already promise-shaped — the handler just parks the
  resolver instead of opening a modal).
- The displayed session's items still render inline in the chat (current
  behavior, minus the window-level modal). Background sessions' items show as a
  badge on the session picker + a compact toast; clicking jumps to that session
  with the item front and center.
- ACP-side: a parked permission request must not time out the turn — verify
  agent behavior with long-pending permissions; if an agent times out, surface
  that as a stall on the session rather than losing the turn.

**Completion criteria:**
- Session A (background) requests permission while I'm chatting in B: B is not
  interrupted; A shows "needs you"; answering it from the picker resumes A.

### 5. Session scope + map presence

**Now:** every session sees and can propose against the whole tree; nothing on
the map indicates an agent is working a region.

**Target design:**
- A session can be given a **scope**: one or more subtree roots (default:
  whole tree). Scope is set at session start (e.g. from the current selection)
  or by telling the agent; carried in the session registry and shown in the
  picker.
- `read_tree` gains an optional scope filter (subtree slice, with ancestors as
  context); `propose_edits` outside scope is a warning surfaced in review, not
  a hard block — scope is a coordination convention, not a security boundary.
- **Map presence:** nodes under an active session's scope get a subtle per-
  session tint/badge (like multi-user realtime presence in
  `redux/ephemeral/realtime-info`); "running" scopes pulse. Overlapping scopes
  between two live sessions raise the overlap warning from outcome 3.

**Completion criteria:**
- I start session A scoped to branch X and session B scoped to branch Y; the
  map shows both territories; each agent's reads and proposals stay in its lane
  by default; overlap is visible before it becomes a conflict.

### 6. Cross-window and cross-tree hardening

**Now:** each window is its own renderer with its own WebSocket to the sidecar
(fine — sessions are id-multiplexed). Cross-tree is already scoped by
projectId. The risks are shared-state races and orphaned sessions.

**Target design:**
- **Chat history store:** `chatHistory.ts` serializes the whole per-project
  store on write — two windows on the same project can last-write-wins clobber
  each other. Move to per-session records (one localStorage key per session, or
  read-merge-write on the store) + `storage` events so pickers stay live across
  windows.
- **Session ownership:** the sidecar keeps sessions alive when a window closes
  (it already does — agent is module-scoped); make any window able to
  `resumeSession` a session it didn't create, with a "attached in another
  window" guard so two windows don't both drive the same session's input.
- **Tree-level concurrency across windows** rides on Holochain — same-agent
  edits from two windows sync through the conductor like two peers; verify the
  draft/rebase machinery (outcome 2) treats "edit arrived by signal" identically
  to "edit made locally".
- Cross-tree needs no special machinery beyond per-project scoping that already
  exists — verify the session registry and inbox are keyed to survive project
  switches (registry is global, filtered by project for display).

**Completion criteria:**
- Two windows, two different trees, an agent running in each: both stream
  independently, histories don't corrupt, closing one window doesn't kill its
  session, and the other window can pick it up.

---

## Build order

| Phase | Outcome | Why this order |
|-------|---------|----------------|
| 1 | **1 — concurrent sessions in one window** | Biggest immediate unlock; pure renderer refactor (registry over singletons); transport already supports it. |
| 2 | **2 — baseline / rebase / conflicts** | Removes the fear of touching the tree; its rebase machinery is a dependency of 3. |
| 3 | **4 — attention inbox** | Cheap once 1 exists (park the promise resolvers, badge the picker); needed before >2 sessions is pleasant. |
| 4 | **3 — per-session drafts** | Needs 1 (session identity in the renderer) and 2 (rebase on confirm). |
| 5 | **5 — scope + map presence** | Quality-of-coordination layer on top of a working concurrent core. |
| 6 | **6 — cross-window hardening** | Mostly verification + the chatHistory write-race fix; the fix itself can land any time. |

Phases 1–2 alone deliver the top-level outcome's core promise: switch freely
between two live sessions, and edit the tree while they run without losing work.

## Open questions (to resolve in conversation before/while building)

- **How many concurrent turns can each backend actually sustain?** One agent
  process, many sessions — Claude-agent-acp vs OpenCode may differ in whether
  two `session/prompt`s truly run in parallel or queue inside the agent. If they
  queue, outcome 1 still works (turns interleave) but expectations should be
  set in the UI ("queued behind session A").
- **Draft rendering with N drafts:** map overlay shows one draft at a time
  (selector), or composite view? Start with one-at-a-time; composite is a later
  nicety.
- **Scope enforcement strength:** warning-only (proposed above) vs hard-block
  for `propose_edits` outside scope. Warning-only preserves agent flexibility;
  revisit if agents wander destructively.
- **Baseline identity:** snapshot hash vs a cheap monotonic counter bumped on
  every local mutation + incoming signal. Hash is simpler and stateless; counter
  is cheaper per-turn. Decide when implementing outcome 2.
