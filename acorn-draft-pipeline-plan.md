# Plan: the draft layer for LLM-proposed tree edits

**For:** an implementing agent (coding agent) working in `acorn/web` on branch `clarity-forge`.
**Parent node:** `#100544` "LLM-proposed edits are reviewed in a non-committed draft layer before they touch the DHT" — `uhCkkP_aCCs5N7SJGhcoA8EYSV1JTO_UHBFJ_IlRkElJNMwRcS3Az`.
**Principle (load-bearing, do not violate):** *Proposed edits are inert until a human confirms them; the draft never persists on its own.* This is plan-mode for tree edits — propose → review/edit → approve → execute. Nothing the LLM proposes touches the DHT until a single human Confirm.

This plan implements the four leaves of that branch. It reuses, rather than reinvents, the branch‑I diff machinery (`ProjectDiff`, glow, per‑node badges, fit‑to‑changed, the cell executor) and the already‑built ACP harness (`HarnessClient` / sidecar / `HarnessChat`).

---

## The four leaves (build targets)

| # | Node | Hash | Scope |
|---|------|------|-------|
| L1 | The LLM proposes a typed edit set through the API, opening a draft | `uhCkktMhcigqUwKDisJzLhciutCRiuQ3xQnkNdU-QC4kg6QjrYFH8` | Small |
| L2 | A proposed edit set renders in diff glow‑mode as a draft overlay | `uhCkkjGdAG1dCZOqv8afx3vWBtf_stLSLh5J-P14HEmEgU__l0-Bh` | Small |
| L3 | A human can edit or reject individual proposed changes within the draft | `uhCkk2dF5_rJkH4fis3hwlNb4V4smx2BwrwMl2BvzYG2GKZAHaiiA` | Small |
| L4 | Confirming a draft commits the accepted edits to the DHT at once; discarding drops them | `uhCkk5j2tMuRUQdY2r6YixOJW4UuiZGhnILrcpB_Hdoi_XR2TsEP6` | Small |

Each leaf's tasks + completion criteria are in the tree; the summaries below are the contract.

- **L1** — `propose_edits(diff: ProjectDiff)` opens/updates the ephemeral draft, **never** a DHT write. Edit shape is branch‑I `ProjectDiff`. Callable by the harness.
- **L2** — render the tree with the draft diff overlaid: added nodes as ghost/draft, updated nodes showing proposed values, removed nodes marked; reuse `setChangedOutcomes` + `perOutcomeChangeStats` so glow + per‑node `+/~/−` badges + fit‑to‑changed show the proposed deltas. **No cell writes while the draft is open.**
- **L3** — per‑change accept/reject + inline edit, mutating the in‑memory draft diff (not the DHT); glow/badges re‑render as it changes; rejected changes are excluded from the eventual commit.
- **L4** — Confirm runs `applyProjectDiffToCell` over the *accepted subset*, clears the draft, lights the committed nodes via the normal post‑apply path. Discard clears the draft, no trace. Both exit draft mode.

---

## What already exists (build on this, don't duplicate)

Verified by reading the current code on `clarity-forge`:

**Diff core — `web/src/migrating/projectDiff.ts`** (pure, tested)
- `ProjectDiff` = per‑collection `{ added, updated, removed }` over `outcomes / connections / tags / outcomeMembers / outcomeComments / entryPoints`, keyed by actionHash.
- `computeProjectDiff`, `applyProjectDiff` (pure, on snapshots), `isEmptyDiff`, `diffStats`, `findUnresolvedReferences`.
- `perOutcomeChangeStats(diff, base) → { [hash]: { isNew, added, updated, removed } }` — the per‑node badge counts.
- `touchedOutcomeHashes(diff)` — the set to light up.

**Cell executor — `web/src/migrating/applyProjectDiff.ts`**
- `applyProjectDiffToCell(diff, projectId, dispatch) → { hashMap, touchedOutcomes, outcomeHashMap }`. Creates (placeholder→live remap), updates by live hash, deletes in reverse dependency order; dispatches the redux create/update/delete actions. **This is the only thing that writes to the DHT.** L4 calls it; L1–L3 must not.
- DI'd internal (`internalApplyProjectDiffToCell`) for unit tests without a conductor.

**Glow / review mode — `web/src/components/AgentDiffTools/AgentDiffTools.tsx`** is the working reference for the whole apply‑then‑light‑up sequence:
- `store.dispatch(unselectAll())` then `setChangedOutcomes(touched, liveStats)` (ephemeral selection slice: `changedOutcomes: ActionHashB64[]`, `changedOutcomeStats: OutcomeChangeStatsMap`; cleared by `clearChangedOutcomes` / `unselectAll`).
- `fitToChanged(touched)` — bbox of touched nodes from `state.ui.layout.coordinates/dimensions`, dispatched after the layout settles (`setTimeout … 800`). **Lift this helper out of AgentDiffTools into a shared module** so L2/L4 reuse it verbatim.
- Amber glow `#FF9500` + per‑node `+/~/−` chips already render off `changedOutcomes` / `changedOutcomeStats` (drawOutcome / drawChangeBadge).

**Map render source — `redux/ephemeral/animations/getGraphForState.ts`**: the map graph is built from `state.projects.outcomes[projectId]` + `state.projects.connections[projectId]` (+ members). **This is the seam for the draft overlay** (see Decision B).

**ACP harness — `web/src/harness/` + `web/dev-harness/sidecar.js` + `HarnessChat.tsx`**
- `HarnessClient` (`types.ts`) is transport‑neutral; provider resolved by `getHarnessClient()` (`devSidecarClient` in dev, `mossClient` stub otherwise).
- `HarnessSession.prompt(blocks)` streams `HarnessUpdate`s (`message / thought / plan / tool_call / mode`); `onPermissionRequest(handler)` is the human‑gate seam.
- Sidecar (`dev-harness/sidecar.js`) owns the ACP `ClientSideConnection`, spawns the agent, relays `session/update` + `session/request_permission` + `fs.*` over the `/__acorn_harness` WS, and forwards MCP servers (`mcpConfig.js`, `toAcpServers`) at `session/new`.
- `HarnessChat.tsx` is the chat UI; today its permission handler is a `window.confirm` (`decidePermission`) — **the explicit placeholder the draft pipeline replaces.**

**Read path — `web/src/harness/readTree.ts`**: `readTree(state, projectId) → ProjectSnapshot` (wraps `collectExportProjectData`); `readSelection`. Today the tree is handed to the agent as a prompt *resource block*, not a callable tool.

---

## Two design decisions to make before coding

These are the only real unknowns; resolve them first (a short spike for A), then the build order is mechanical.

### Decision A — how does the agent's proposal reach `propose_edits`? (gates L1)

**There is no Acorn‑hosted MCP server today — confirmed against the code.** `read_tree` (`web/src/harness/readTree.ts`) is **prompt context, not a callable tool**: `HarnessChat.tsx:401` injects its output as a `resource` block each turn; the agent reads it, it cannot invoke it. The only MCP machinery (`dev-harness/mcpConfig.js` + `sidecar.js`) is the *inbound attach* path that forwards *external* servers (Linear, etc.) to the agent. Acorn exposes zero callable tools. So `propose_edits` is not "add a tool to an existing server" — **standing up the hosted callable‑tool channel is the work.**

The agent runs as a subprocess under the sidecar and speaks ACP. For it to *call* `propose_edits`, Acorn needs an **agent → Acorn callback channel**. Candidates:

1. **Acorn‑hosted MCP server (recommended).** Acorn provides a small stdio MCP server exposing `read_tree` and `propose_edits(diff)` to the agent, attached via the existing `mcpServers` seam (`toAcpServers` already forwards stdio servers). The server bridges each `tools/call` back to the renderer over the `/__acorn_harness` WS (new request/response frames in `protocol.ts`), where `propose_edits` lands in the draft store. This matches the tree's own language ("read_tree and propose_edits together form the MCP‑style surface"). **It also completes the sibling read leaf** *"An LLM can read the live tree through the API"* (`uhCkkTRpwnJg9ruwBrSJVKtAtRXfhg3l2KvwSClkLQhJxTyS_tJhk`) — migrating `read_tree` from resource‑injection to a real callable tool is one of its unchecked tasks, so build both tools on this server at once. **Cost:** one new MCP server process (`@modelcontextprotocol/sdk`) + a small set of WS frame types + renderer handlers.
2. **ACP native plan mode as the gate.** Surface the agent's `plan` stream as the draft. *Rejected as the primary path:* a plan is prose steps, not a typed `ProjectDiff`, so it can't drive `applyProjectDiffToCell`. Keep plan‑mode as a complementary review signal, not the edit transport.
3. **`session/request_permission` interception.** Reuse the permission seam to approve a structured edit. Workable but overloads a yes/no gate with payload; less clean than (1).

**Recommendation:** build (1). But note the decoupling below — **L2/L3/L4 do not depend on Decision A.** They consume a `ProjectDiff` from the draft store regardless of how it got there. So build the draft store + overlay + review + commit first, drive them from a **local/test diff and from the existing file‑import path**, and wire the agent channel (L1) last. This keeps the risky transport work off the critical path and lets the human verify the whole review/commit UX early.

### Decision B — how is the uncommitted draft rendered without a DHT write? (gates L2)

The map builds its graph from `state.projects.outcomes[projectId]`. Two ways to show draft nodes:

1. **Overlay at the graph seam (recommended, principled).** Add an ephemeral `state.ui.draft` slice holding the proposed `ProjectDiff` (+ per‑change accept/reject flags). In `getGraphForState` (and the connection source), merge the draft's `added`/`updated` outcomes & connections over the persisted slices *for rendering only*, tagging draft/added/updated/removed so the renderer can style ghosts and strike‑through removals. The persisted `projects.*` slices are never touched, so "draft never persists" holds by construction. Glow + badges come from `setChangedOutcomes(touchedOutcomeHashes(draft), perOutcomeChangeStats(draft, liveSnapshot))`.
2. **Inject placeholder nodes into `projects.outcomes` and remove on discard.** Simpler to render (reuses everything) but pollutes the persisted slice, risks a DHT signal clobbering mid‑draft, and blurs the "never persists" invariant. *Rejected* except as a throwaway spike.

**Recommendation:** (1). Draft outcomes use synthetic placeholder hashes (e.g. `draft:<n>`); on Confirm, `applyProjectDiffToCell`'s existing placeholder→live `hashMap`/`outcomeHashMap` remap turns them into real nodes — so the synthetic hashes never reach the DHT.

---

## Build order & checkpoints

> **Why explicit export/import + commit checkpoints?** The in‑app draft pipeline that will eventually let the LLM update the tree's *own* progress doesn't exist yet — that's what we're building. Until it does, we keep the clarity tree in sync the branch‑I way: after each phase, **commit the code**, then **hand Eric a progress diff** that flips the just‑completed tasks/criteria, via the file loop. Dogfood, bootstrap‑style.

### Checkpoint mechanics (how to sync the tree at each phase)

The live bridge dir is `/tmp/acorn-clarity/`. The live project name sanitizes to `acorn-clarity-trees-living-spec`, so:
- baseline the agent reads: `/tmp/acorn-clarity/acorn-clarity-trees-living-spec-tree.json`
- progress diff you hand to Eric: `/tmp/acorn-clarity/acorn-clarity-trees-living-spec-apply.json`

At each checkpoint:
1. `git add -p && git commit` the phase's code (message scoped to the leaf, e.g. `feat(clarity): draft store + overlay (L2)`). **No co‑author/attribution trailers** (global rule).
2. Build a progress `ProjectDiff` **against the current `-tree.json`** so its `updated` keys are that tree's real, stable hashes (node action‑hashes are stable across updates — verified). For each completed task: read the leaf outcome by its hash (see table above), set the matching `taskList[i].complete = true`, and when a leaf's criteria are met set `scope.Small.achievementStatus = "Achieved"`. Emit `{ outcomes: { added:{}, updated:{ <hash>: <newOutcome> }, removed:[] }, connections:{…empty…}, … }` with `removed: []` everywhere (diff‑safety invariant — never hand a full tree; a stale full tree deletes data).
3. Write that diff to the `-apply.json` path and tell Eric: *"click LLM ▸ import changes"*. He verifies the nodes light up, then re‑exports; refresh the committed baseline `web/sample-imports/acorn-clarity-living-spec-tree.json` (and `/tmp` baseline) from his clean `~/Downloads/Acorn-→-Clarity-Trees-(living-spec)-<date>.json` so all three stay in sync.

Gotchas to respect (from branch‑I experience):
- **Only `updated`/`removed` are idempotent.** Avoid `added` in progress diffs (re‑import duplicates added nodes — fresh hashes each time). Progress diffs should be pure `updated`.
- Don't export twice in a row (clobbers `-diff.json`).

---

### Phase 0 — shared scaffolding (no leaf; enables all)
- Lift `fitToChanged` out of `AgentDiffTools.tsx` into a shared helper (e.g. `web/src/components/diffReview/fitToChanged.ts`) and have AgentDiffTools import it. Pure refactor; run the suite to prove no behavior change.
- Add the ephemeral **draft slice** `redux/ephemeral/draft/` (state + actions + reducer): `draft: ProjectDiff | null`, plus per‑change decision flags (Phase L3 extends this). Actions: `openDraft(diff)`, `updateDraft(diff)`, `setChangeDecision(key, accepted)`, `clearDraft()`. Reducer is pure → unit‑test it.
- **Tests:** draft reducer (open/update/clear/decision toggles). **Checkpoint:** commit `chore(clarity): shared fitToChanged + ephemeral draft slice`. (No tree tasks to flip yet.)

### Phase 1 — L2: render the draft as a glow overlay
*(built before L1 deliberately — see Decision A. Drive it from a test diff / the file‑import path.)*
- Overlay the draft diff at `getGraphForState` (Decision B.1): merge `draft.added`+`draft.updated` outcomes and connections into the render graph, tagged `draft`/`removed`. Mark removed nodes (e.g. dim + strike). Style added/ghost nodes distinctly from committed ones.
- On `openDraft`: `unselectAll()` + `setChangedOutcomes(touchedOutcomeHashes(draft), perOutcomeChangeStats(draft, readTree(state, projectId)))`, then `fitToChanged(...)` after layout settles. Reuses the exact branch‑I glow + badge + fit path.
- Add a temporary "load test draft" affordance (dev‑only, can sit by `AgentDiffTools`) that calls `openDraft` with a `ProjectDiff` read from a file, so the overlay is verifiable **with no agent**.
- **Completion criterion (human):** open a draft → affected nodes glow amber with correct `+/~/−` badges, fit in view, **nothing written to the DHT** (verify: reload → tree unchanged).
- **Tests:** overlay merge is pure/unit‑tested (added → ghost in graph, removed → marked, updated → proposed values); `touchedOutcomeHashes`/`perOutcomeChangeStats` already covered.
- **Checkpoint:** commit `feat(clarity): draft overlay glow-mode (L2)`; hand progress diff flipping L2's tasks + `Achieved`.

### Phase 2 — L3: edit / reject individual proposed changes
- Per‑node accept/reject controls in draft mode (a small inline control on each draft‑changed node, and/or a list in a draft panel). Rejecting drops that node's entry from the *effective* draft; the underlying proposal is retained but flagged rejected so glow/badges recompute from the accepted subset.
- Inline edit of a proposed node's content/fields writes back into the draft diff's `updated`/`added` entry (reuse the existing `OutcomeFieldsEditor` against the draft entry rather than the live outcome).
- Recompute glow + badges from the accepted+edited subset on every change.
- **Completion criterion (human):** edit one proposed node + reject another; the *accepted+edited* set is what survives.
- **Tests:** "effective draft" derivation (apply decisions + inline edits → resulting `ProjectDiff`) is pure/unit‑tested across the matrix (accept‑all, reject‑some, edit‑then‑accept).
- **Checkpoint:** commit `feat(clarity): per-change edit/reject in draft (L3)`; hand progress diff for L3.

### Phase 3 — L4: confirm / discard
- **Confirm:** compute the effective `ProjectDiff` (accepted + edited subset), run `applyProjectDiffToCell(effective, projectId, dispatch)`, then `clearDraft()` and light the committed nodes via the **normal post‑apply path** (the AgentDiffTools sequence: remap `perOutcomeChangeStats` keys through `outcomeHashMap`, `setChangedOutcomes`, `fitToChanged`). Confirm exits draft mode.
- **Discard:** `clearDraft()` only — no cell writes. Exits draft mode.
- Run `findUnresolvedReferences(effective, currentSnapshot)` before committing; refuse + surface if non‑empty (mirrors AgentDiffTools).
- **Completion criterion (executable):** confirming persists exactly the accepted edits and they survive reload; discarding leaves the tree unchanged. Add a test over `internalApplyProjectDiffToCell` with mocks asserting create/update/delete calls match the accepted subset; assert discard issues zero zome calls.
- **Checkpoint:** commit `feat(clarity): confirm/discard draft commit (L4)`; hand progress diff for L4. At this point the full **local** draft loop (load test diff → review → confirm/discard) works end‑to‑end without an agent — a natural point for Eric to verify live.

### Phase 4 — L1: `propose_edits` opens the draft (agent channel)
*(Decision A.1. Note: this is "build the hosted callable‑tool channel," not "add one tool" — there is no server yet.)*
- Implement the agent → Acorn channel: an Acorn‑hosted stdio MCP server exposing `read_tree()` and `propose_edits(diff: ProjectDiff)`, attached to the agent via the existing `mcpServers` seam. Each `tools/call` bridges over `/__acorn_harness` to the renderer (new request/response frame types in `protocol.ts` + handlers in `devSidecarClient.ts`). Building this also satisfies the sibling read leaf `uhCkkTRpwnJg9ru…` (read_tree as a callable, versioned tool rather than a prompt resource).
- `propose_edits(diff)` → renderer dispatches `openDraft(diff)` (or `updateDraft` if one's open). **Guarantee no DHT write on propose** (it only touches the ephemeral draft slice).
- Replace `HarnessChat`'s `window.confirm` `decidePermission` placeholder where appropriate, so a proposal surfaces as the draft rather than a blind allow/reject.
- **Completion criterion (executable):** `propose_edits` opens a draft and writes nothing to the DHT. (Unit‑test the renderer handler: a `propose_edits` frame dispatches `openDraft` and issues zero zome calls.)
- **Live verification (Eric):** `ACORN_HARNESS_CMD=… yarn harness:claude` + `yarn desktop:happ` → ask the agent in chat to add/modify a node → it calls `propose_edits` → the draft opens in glow‑mode → Eric edits/rejects → Confirm commits.
- **Checkpoint:** commit `feat(clarity): propose_edits opens draft over MCP (L1)`; hand progress diff flipping L1 + the parent branch node `uhCkkP_aCCs5N7…` toward Achieved once all four leaves verify.

---

## Risks & gotchas (read before starting)

- **The invariant is the spec, not the mechanism.** "A draft exists" is not the bar; "nothing reaches the DHT until human Confirm" is. Make completion criteria tests of *that* (e.g. discard issues zero zome calls; reload after propose shows an unchanged tree). This is the exact failure mode that bit branch I — satisfying the letter while leaving a write path that violated the spirit.
- **Draft must never enter `projects.*`.** Keep it in `ui.draft` and overlay only at render. If you take the placeholder‑injection shortcut (Decision B.2), a DHT signal can clobber mid‑draft and the persisted slice can leak draft nodes.
- **Synthetic hashes for added draft nodes** must be remapped to live hashes by `applyProjectDiffToCell` on Confirm (its `hashMap` already does this for creates) — never send a `draft:*` hash to a zome call.
- **Progress diffs are `updated`‑only with `removed: []`.** `added` re‑imports duplicate; a full‑tree apply deletes. Build them against the *current* `-tree.json`'s real hashes.
- **Keep the harness extractable.** The MCP server + WS frames are a dev‑sidecar concern; mirror the existing host‑affordance split so a future Kangaroo/Moss host can provide the same channel (see `harness/index.ts` provider resolution).
- **tsc baseline noise:** pre‑existing `node_modules` lib errors (`Uint8Array`/`MapIterator`) are unrelated; only judge tsc on touched files. Jest is the real gate (currently green, suite ~82 tests).

## Definition of done
All four leaves' completion criteria pass; Eric verifies the live agent loop (Phase 4); the four leaf nodes + the parent branch are flipped to Achieved in the tree via the file loop; `web/sample-imports/acorn-clarity-living-spec-tree.json` refreshed from Eric's clean export.
