# Session brief — implement the LLM-direct-API branch (Acorn clarity tree)

## Goal
Begin implementing the **"LLM can interact directly with the tree via an API"** branch of the Acorn clarity tree. Two leaves are the immediate targets:
- **"An LLM can read the live tree through the API"** (`read_tree`)
- **"Acorn connects to a local LLM harness over ACP, driven from an in-app chat"** (the harness/chat transport)

Do **NOT** code first. The harness connection has a load-bearing architecture decision (below) — start with a **plan-mode design pass**, then build. `read_tree` can proceed in parallel as an isolated, tested unit.

## Where things stand
- Repo: `/home/eric/code/metacurrency/holochain/acorn`, branch `clarity-forge`. UI is the React/webpack `acorn-ui` workspace under `web/`.
- The clarity tree is the living spec; we dogfood (build what the tree describes, the tree tracks its own progress). The branch was just built out and committed as the official baseline `f167675c` → `sample-imports/acorn-clarity-living-spec-tree.json`.
- Read these memories first: **acorn-llm-api-impl-architecture** (architecture facts + the dual-context constraint), **clarity-forge-branch-i** (the diff/loop history + the new direction), **clarity-tree-composition-invariant** (tree-building rules, if you touch the tree).

## The branch (from the baseline)
```
LLM can interact directly with the tree via an API
├─ A node has a stable, human-usable reference that survives rearrangement   (stub, still in discussion)
├─ LLMs have a well-tuned skills file for building effective clarity trees    (+5 children)
├─ An LLM can read the live tree through the API                             ← TARGET (read_tree)
├─ A human directs tree edits in conversation, reviewed in a draft before they commit
│  ├─ Acorn connects to a local LLM harness over ACP, driven from an in-app chat   ← TARGET (harness/chat)
│  └─ LLM-proposed edits are reviewed in a non-committed draft layer (plan mode)
│     └─ propose / render-as-draft / edit-reject / confirm-discard
└─ An LLM can perform the work specified by a leaf when manually triggered
```

## Architecture constraints (the why behind plan-first)
- Acorn UI is a **browser/renderer context** — **no subprocess spawning, no Node**. It reaches the Holochain conductor over a websocket (`getAppWs`). No existing AI/chat/LLM/ACP/MCP code — greenfield.
- **ACP** (Agent Client Protocol) is JSON-RPC over stdio; the client **spawns** the agent (LLM harness, e.g. local Claude Code). So the ACP client must live where it can spawn — **Electron main process, or a small local sidecar** (extend the existing `web/webpack.dev.js` `/__acorn_diff/` dev-bridge pattern). The renderer talks to that bridge over HTTP/WebSocket.
- **Dual-context, extractable harness (the key constraint):** the harness connection must NOT be Acorn-specific. It has to work as a **host-provided affordance** in two contexts:
  - **Kangaroo/Electron** — Acorn's main/sidecar provides the harness.
  - **Moss/Weave** — the harness is a **generalized affordance Moss provides to ALL tools**, surfaced through the Weave host API; Acorn just consumes it.
  - So design a **harness-client interface** the UI consumes, with two providers behind it. Precedent: `isWeaveContext()` + `@theweave/api` already gate Moss-only features (e.g. Moss-only attachments).
- **`read_tree` is cheap:** `web/src/migrating/export.ts` `collectExportProjectData(state, projectId)` already produces the `ProjectSnapshot`. `read_tree` exposes that — low risk, unit-testable in isolation, independent of the transport decision.

## Plan for this session
1. **Plan-mode design pass** (use plan mode / the Plan agent) on the **harness-client abstraction**: the interface the UI consumes; the Kangaroo provider (Electron-main/sidecar spawning ACP); how the Moss provider plugs into the Weave host API. Research current ACP + Weave host-API surface as needed. Output: a concrete interface + provider plan before any UI code.
2. **`read_tree` in parallel** — wrap `collectExportProjectData` as the read surface; unit-test it.
3. **Thin vertical slice** of chat → harness → reply rendered (the X0 leaf), over the abstraction from step 1.
4. **Wire `read_tree`** in as the tree context the harness sees.

## How progress returns to the tree
As leaves land, mark them in the tree via the diff loop: write a ProjectDiff to `/tmp/acorn-clarity/acorn-clarity-trees-living-spec-apply.json` (the human clicks "import"). Keep edits as diffs with `removed: []`; honor the composition invariants. After Eric exports, refresh `sample-imports/acorn-clarity-living-spec-tree.json` and commit.

## Verify in the running app
Desktop: `yarn desktop:ui` + `yarn desktop:happ` (Electron + conductor). The diff tools (Export/Import) live in `web/src/components/AgentDiffTools/`.
