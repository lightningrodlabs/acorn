# Concurrent sessions — build plan

Execution companion to [acorn-concurrent-sessions-plan.md](acorn-concurrent-sessions-plan.md)
(the design). That doc says *what* to build; this one says *how we work through it*:
the per-phase loop, where the grounding tests live, and how the exported living-spec
tree gets updated as each leaf lands.

## The problem this plan exists to solve

This work rewrites the agent window itself, so the usual dev-mode loop — drive Acorn
with the agent, watch it work — is compromised: the thing under test is the thing
doing the testing. A broken registry doesn't show up as a failed assertion, it shows
up as a chat that quietly stops streaming, and you can't tell whether the agent lost
the turn or the panel lost the agent. Phase 1 was built this way and the result is
visible in the tree: the code is ~80% there, and *nothing* records which parts were
actually exercised.

So the rule for the rest of this tree: **every leaf is grounded by a named automated
test before it is marked Achieved.** Live dogfooding stays useful for finding
problems; it does not count as evidence that a leaf is done. Manual checks are
listed explicitly per phase and kept to the ones that are irreducibly visual or
require a real backend.

## The per-phase loop

Each phase is one leaf of the concurrent-sessions branch, and runs the same five steps:

1. **Refresh the export.** Re-export the living-spec tree from Acorn over
   `sample-imports/acorn-clarity-trees-living-spec-tree.json` *before* touching it.
   The live tree drifts (it's edited in-app between sessions); editing a stale export
   and re-importing would resurrect deleted nodes. If the working tree shows no
   uncommitted change after re-export, the file was already current.
2. **Build the leaf** — code only for that leaf's task list.
3. **Write the grounding tests** named in the phase below. They must fail before the
   change and pass after.
4. **Update the export file in-repo**: check off the leaf's completed tasks, set
   `achievementStatus: 'Achieved'`, and add the leaf's completion criteria naming the
   grounding test (`test/<file>.test.ts::<case>`) so achievement is checkable, not
   asserted. This is a hand-edit of the JSON, guarded by the export test in Phase 0.
5. **Commit code + export together**, then import the diff back into the live tree via
   the existing diff-import path so Acorn and the repo agree.

Steps 1 and 5 are the only places the live tree and the repo file can diverge; keeping
them adjacent to each commit is what keeps the tree usable as the source of truth
rather than an aspirational snapshot.

## One-time test infrastructure

Two tracks, because the risk splits in two: the *protocol/state* risk (does a
background turn actually keep streaming into the right entry?) and the *wiring* risk
(does the panel, with its effects and ordering, present that correctly?).

### Track A — harness-level integration (no new dependencies)

`test/harnessConcurrency.test.ts`. Drives the real stack below React: a fake
WebSocket ↔ `DevSidecarHarnessClient` ↔ `SessionRegistry` ↔ `handleAcornToolCall`,
with two sessions in flight at once. Node environment, same shape as the existing
`directBackend.test.ts` / `skill.test.ts`, which already test dev-harness code
directly. This is where the concurrency contract gets pinned down: frames for session
A never mutate session B's entry, a `toolCall` frame carrying B's `sessionId` resolves
against B's project, an error frame kills only its own turn.

### Track B — panel mounting under jsdom (needs setup)

`test/harnessChatPanel.test.tsx`. The largest and riskiest change so far — the
HarnessChat rewrite from state-owner to view — has no test at all. There is no
component-test infrastructure in the repo yet; adding it costs:

- devDeps: `jest-environment-jsdom@^29` (matches jest 29), `@testing-library/react@^12`
  (the React 16-compatible line), `@testing-library/jest-dom@^5`.
- `jest.config.js`: widen the transform key from `'^.+\\.[tj]s$'` to `'^.+\\.[tj]sx?$'`,
  add `'@babel/preset-react'` to the preset list (already in devDependencies), and add
  `moduleNameMapper` for `\.(scss|css)$` → a local `test/styleStub.js`.
- Per-file `@jest-environment jsdom` docblock, so the other 32 suites keep running in
  the faster node environment.
- Mount-time seams: `jest.mock` for `../src/harness` (`getHarnessClient` → a scriptable
  fake client), plus a `Provider` with a mock store (`test/mockRootState.ts` exists) and
  a `MemoryRouter` for `useRouteMatch`.

That's a half-day of setup that pays for every subsequent phase — leaves 4, 3 and 5 are
all panel-behaviour leaves whose completion criteria are otherwise unfalsifiable.

## Phase 0 — ground and finish what's already built

Leaf: *Multiple sessions run turns concurrently in one window…* (currently
`NotAchieved`, 4 of 6 tasks effectively done, 0 checked).

**Tests first — the missing net for the riskiest change:**

- `test/harnessChatPanel.test.tsx` (Track B):
  - send in A, switch to B while A streams, send in B, switch back → A's text is
    complete and B's is intact (the panel's core promise, currently untested);
  - switching projects mid-turn leaves the turn running and re-displays it live on
    return;
  - Stop cancels only the displayed session;
  - the picker's live dot reflects a *background* session's state.
- `test/harnessConcurrency.test.ts` (Track A): the frame-level contract above.

**Then close the two real gaps:**

- **Reload resumes every live session, not just the current one.** Today `connect()`
  resumes only `getCurrentId(chatKey())`, so a second mid-turn session is dark until
  clicked, and updates during the gap are lost — this is the one leaf-1 completion
  criterion that demonstrably fails. Fix by asking the host what it has: add a
  `sessions` query frame to the sidecar protocol returning `{sessionId, inFlight}[]`
  (the sidecar already knows, in `state.activePrompts`), and reattach every in-flight
  session for the current project on connect. Grounding test: Track A.
- **Resolve the backend-parallelism unknown.** No unit test can answer this for a real
  agent, so make it a scripted probe rather than a clicking session:
  `web/dev-harness/probe-concurrency.js` opens two ACP sessions against the configured
  backend, prompts both, and prints the interleaving. Run it once per backend
  (claude-agent-acp, OpenCode, direct), record the answer in the leaf's task, and add
  the "queued behind session A" hint only if a backend actually serialises.

**Stopgap worth taking now** (not leaf-1 scope, but concurrency is already live in your
dev use): `propose_edits` currently merges a second session's diff into whatever draft
is open (`acornTools.ts:122-125`) — silent cross-session contamination, and across
projects it replaces the draft outright. Until Phase 4 gives each session its own
draft, stamp the draft with its owning `sessionId` and reject a second session's
proposal with an error the agent can act on ("a draft from session X is open — wait or
ask the human to confirm it"). Small, and it converts a silent data problem into a
legible one. Grounding test: extend `test/acornTools.test.ts`.

**Then** check off all six tasks, mark the leaf Achieved with criteria naming the tests.

Also in Phase 0, the guard for the loop itself: `test/livingSpecExport.test.ts` — the
exported living-spec tree parses, imports cleanly through the existing import path, and
every node reachable from the concurrent-sessions parent has a well-formed scope. We
hand-edit this file every phase; this is what stops a bookkeeping typo from silently
corrupting the tree.

## Phase 1 — baseline stamping, rebase, conflicts

Leaf 2. The design decision the tree defers — baseline identity — resolves to
**snapshot hash**: stateless, and `ProjectSnapshot` / `computeProjectDiff` already give
us the canonical form to hash. A counter would need a mutation-observing home in redux
and buys little.

The bulk of this leaf is pure logic, which makes it the best-tested phase of the tree:
a `rebaseDiff(baseline, live, diff)` module returning `{applied, rebased, conflicted}`.

- `test/rebaseDiff.test.ts`: disjoint edits merge; agent-description + human-move
  three-way merges; same-field collision marks conflicted and defaults to reject;
  node deleted under the diff; the tree moving under an open draft re-rebases.
- Extend `test/readTree.test.ts` (baseline id present and stable across identical
  snapshots) and `test/draftCommit.test.ts` (Confirm re-rebases and refuses to
  silently overwrite).
- Manual (visual only): the conflict presentation in the review panel — baseline →
  live → proposal.

## Phase 2 — attention inbox

Leaf 4. Pull it ahead of per-session drafts as the design's build order already has it;
it also retires the last global modal, which is the thing that makes running three
sessions unpleasant today.

- `src/harness/attentionInbox.ts` — a framework-free store like the registry: park the
  promise resolver as an item attributed to a session, resolve on decision.
  `test/attentionInbox.test.ts` covers parking, per-session queueing, resolution
  ordering, and that a parked request never resolves twice.
- Track B: a background session's permission request badges the picker instead of
  opening a modal; clicking the badge displays that session with the item in view.
- Manual: confirm a long-parked permission doesn't time the agent out — or better,
  script it in Track A with a fake client that reports a timeout, and surface it as a
  stall on the session.

## Phase 3 — per-session drafts

Leaf 3. Needs Phase 0's session identity and Phase 1's rebase.

- `draftReducer.test.ts` extended for `Map<sessionId, {diff, projectId, decisions, baseline}>`:
  two sessions' drafts coexist; `alreadyOpen` merging applies within one session only;
  confirming one rebases the others and flags newly-conflicted changes.
- `test/acornTools.test.ts`: cross-session overlap on the same node is detected at
  propose time (replaces the Phase 0 stopgap's blanket rejection).
- Manual (visual only): the draft selector and which draft the map overlay renders.

## Phase 4 — session scope and map presence

Leaf 5.

- `readTree.test.ts`: scope filter returns the subtree slice plus ancestors as context.
- `test/acornTools.test.ts`: out-of-scope `propose_edits` warns, never blocks.
- Map presence tint/pulse is genuinely visual — manual, and the only leaf where that's
  the honest answer.

## Phase 5 — cross-window and cross-tree hardening

Leaf 6.

- `chatHistory.test.ts`: two simulated windows over one storage — read-merge-write, no
  last-write-wins clobber (this fix can land any time and is worth pulling forward if
  you hit it in dev).
- Track A: `resumeSession` from a second attachment; the "attached in another window"
  guard refuses a second driver.
- Track A: an edit arriving by Holochain signal rebases identically to a local edit.
- Manual: two real windows, one project, close one mid-turn and pick it up in the other.

## Order and cost

| Phase | Leaf | Grounding tests | Manual |
|---|---|---|---|
| 0 | 1 — concurrent sessions | panel mount, harness concurrency, export guard | backend probe (scripted, one run per backend) |
| 1 | 2 — baseline / rebase | rebaseDiff, readTree, draftCommit | conflict presentation |
| 2 | 4 — attention inbox | attentionInbox, panel mount | — |
| 3 | 3 — per-session drafts | draftReducer, acornTools | draft selector / overlay |
| 4 | 5 — scope + presence | readTree, acornTools | map tint |
| 5 | 6 — cross-window | chatHistory, harness concurrency | two-window run |

Phase 0 is the only one that pays infrastructure cost; every later phase spends it.
Phases 0–1 together deliver the top-level outcome's core promise — switch freely
between live sessions, and edit the tree while they run without losing work.

## Risks

- **Track B mounting drags in the app.** HarnessChat imports the redux store, the
  router, and the harness client singleton. If mocking those turns into a fight, the
  fallback is to extract the panel's decision logic (display derivation, tool routing,
  `liveStatus`, the delete/move/send guards) into a pure `src/harness/panelState.ts`
  and unit-test that in node — weaker evidence, since it doesn't cover effect ordering,
  which is exactly where the rewrite's risk lives. Try the mount first.
- **Export drift.** Step 1 of the loop is the mitigation; skipping it once is enough to
  reintroduce a deleted node.
- **Marking Achieved from a green test that tests the wrong thing.** Each leaf's
  criteria should name the *behaviour*, with the test as evidence — not name the test
  as the behaviour.
