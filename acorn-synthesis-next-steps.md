# Acorn Synthesis & Next Steps

## What I absorbed from the conversation + thoughts doc

The conversation landed on a precise and important distinction: Acorn is not an AI agent orchestration platform, it's a **human deliberation tool** that produces structured dependency trees AI agents can consume. The ontological primitives — declarative outcomes, uncertainty modelling, computed achievement propagation — are the real asset. The three-context analysis (values-aligned web3/4, Global South/impact sector, humanitarian/oppressive regimes) demonstrated that these primitives are culturally universal even though their current visual rendering is Western-knowledge-worker-centric.

The key insight I want to build on: **the feedback loop between deliberation and execution is the product**. Humans think in Acorn, agents execute from what Acorn exports, progress flows back into Acorn, humans refine their thinking. The tree is alive.

---

## The Three Sample Outcome Trees

A single import file at `sample-imports/acorn-ai-integration.json` was created containing three projects (later split into individual files for import compatibility):

**1. "Acorn Guides AI-Augmented Development"** (18 outcomes) — The meta/dogfooding tree. This IS the project of making Acorn work with AI agents. Five branches:
- Programmatic import (docs, API, NLP generation)
- Reading project state (queryable tools, progress, dependencies)
- Updating achievement (marking done, notifications)
- Measurability (the new field, leaf-level criteria)
- Feedback loop (reflection, agent proposals)

**2. "Community Currency Launch"** (19 outcomes) — Inspired directly by the Sarafu Network analysis in acorn-thoughts.md. Four branches: governance, technical infrastructure, community adoption, measurable economic impact. Every leaf has concrete "how will you know" criteria — e.g., "5 people who weren't involved in design can join and make their first transaction with ambassador help only."

**3. "Distributed Open Source Release v2.0"** (17 outcomes) — A realistic software release coordination scenario. Architecture visibility, feature implementation, distributed QA, and shipping. Demonstrates how the tree replaces the pile of GitHub issues + Slack threads + spreadsheet nobody updates.

Each tree is designed to test the hypothesis differently:
- Tree 1 tests whether Acorn can guide its own development (recursion!)
- Tree 2 tests whether outcome trees work for non-software domains
- Tree 3 tests whether outcome trees replace traditional release coordination

---

## On Measurability

The gap is:

- **Description** = what the outcome IS
- **Task list** = steps to GET THERE
- **Measurability** = how anyone (human or agent) KNOWS IT'S REAL

These are three different things and currently Acorn collapses the third into the first two. At high levels of the tree, measurability is often just "all children achieved" — and that's fine. The computed achievement propagation already handles that. But at the leaves and at critical mid-level outcomes, hand-waving over measurability is where projects silently fail.

**Proposed approach**: Add an optional `measurability: string` field to the Outcome schema. At leaf level, it's where you write concrete testable criteria ("tests pass", "5 users complete the flow without help", "transaction logs show 3 consecutive months above threshold"). At mid-level, it can override the default computed status with an explicit check. At the root, it's often empty because the children ARE the measure.

In the sample trees, measurability is embedded in the description field as "Measurability:" prefixed text — this works as a convention today even before the schema changes.

For agents specifically, leaf-level measurability criteria that are machine-evaluable ("endpoint returns 200", "CI is green", "file exists at path X") become incredibly powerful — the agent can check its own work.

---

## On Integration Approach: MCP vs CLI vs Emerging Alternatives

The landscape as of early 2026 has settled into a clear pattern with three major protocols:

**MCP (Model Context Protocol)** — Anthropic's standard, now widely adopted. Agent-to-tool integration. The agent calls tools that read/write Acorn data. This is the most natural fit for Claude Code and similar LLM-based agents.

**A2A (Agent-to-Agent Protocol)** — Google's standard for agent-to-agent communication. Not relevant yet for Acorn's use case (Acorn isn't an agent, it's a deliberation tool), but could matter later if Acorn needs to coordinate with other agent systems.

**ACP (Agent Communication Platform)** — Lightweight REST-based alternative. Simple HTTP endpoints, no special SDKs.

**Recommendation: Start with MCP, but design the core as a library.**

Here's why:

1. **MCP is the right first choice** because it's what Claude Code (and increasingly other AI tools) natively speaks. An Acorn MCP server would expose tools like `list_projects`, `get_outcome_tree`, `get_next_actionable`, `mark_achieved`, `import_tree`. This gives immediate value — you could use Acorn from this very conversation.

2. **But the underlying functions should be a clean API layer** that MCP, CLI, HTTP, and Holochain zome calls all wrap. The operations are the same regardless of transport:
   - Read: list projects, get tree, query progress, traverse dependencies
   - Write: import tree, create outcome, update achievement, check off tasks
   - Propose: suggest new outcomes, flag re-scoping needs

3. **CLI is still valuable as a complementary interface**, not an alternative. Agents that work via shell (like Claude Code) can use CLI directly. `acorn import tree.json`, `acorn status --project "Release v2.0"`, `acorn mark-achieved <hash>`. This also gives you a testing/debugging tool for free.

4. **Claude Code hooks** are worth considering as a lightweight bridge. A hook that runs on certain events could sync state between a coding session and an Acorn project — e.g., when tests pass, update the relevant outcome.

5. **What to deprioritize**: A2A (premature — Acorn isn't an agent), webhooks/event-driven (adds complexity without clear immediate value), LSP-style (wrong domain).

**The architecture:**

```
┌─────────────────────────────────┐
│  Acorn Core API (library)       │
│  - importTree()                 │
│  - getOutcomeTree()             │
│  - markAchieved()               │
│  - queryProgress()              │
│  - proposeModification()        │
└──────┬──────┬──────┬────────────┘
       │      │      │
   ┌───┴──┐ ┌┴───┐ ┌┴────────┐
   │ MCP  │ │CLI │ │Holochain│
   │Server│ │    │ │ zome    │
   └──────┘ └────┘ └─────────┘
```

The MCP server and CLI both call the same core functions. The Holochain zome is the persistence layer underneath. This means you build the API once and get three integration surfaces.

**One more thought on emerging practices**: There's an interesting pattern emerging where tools provide both MCP AND a simpler "tool description" format that agents can discover and use without a running server. Essentially, a JSON schema of available operations that an agent can read and then call via HTTP or CLI. This "capability card" pattern (borrowed from A2A's agent cards) could be useful for Acorn — an agent discovers what Acorn can do by reading a manifest, then chooses the best integration path available.

---

## Suggested Next Steps

The trees are ready to test the hypothesis. If they import and render well as visual dependency trees in Acorn, that validates the core idea. If they don't (too many nodes, layout breaks, descriptions too long), that tells you what to fix first.

The highest-leverage first move is probably: **try importing the JSON and see what happens**. Then decide which affordances to build first — the measurability field, the MCP server, or the import tooling improvements.

---

## Import Format Notes

The import UI (`ImportProjectModal.tsx`) validates against `BackwardsCompatibleProjectExportSchema` — a single project at root level, NOT the `AllProjectsDataExport` wrapper with `myProfile`/`projects` array.

Required root structure:
```json
{
  "projectMeta": { ... },
  "outcomes": { "actionHash": { ... }, ... },
  "connections": { "actionHash": { ... }, ... },
  "outcomeMembers": {},
  "outcomeComments": {},
  "entryPoints": {},
  "tags": {}
}
```

Action hashes must be 53-character strings with correct Holochain prefixes (`uhCkk` for ActionHash, `uhCAk` for AgentPubKey) encoding valid 39-byte hashes. The `creatorAgentPubKey` on outcomes should be a real agent pub key from the target Holochain network.

---

## Sources

- [AI Agent Protocols 2026: Complete Guide](https://www.ruh.ai/blogs/ai-agent-protocols-2026-complete-guide)
- [Top AI Agent Protocols - MCP, A2A, ACP](https://getstream.io/blog/ai-agent-protocols/)
- [MCP vs A2A: Protocols for Multi-Agent Collaboration](https://onereach.ai/blog/guide-choosing-mcp-vs-a2a-protocols/)
- [Architecting Agentic MLOps with A2A and MCP - InfoQ](https://www.infoq.com/articles/architecting-agentic-mlops-a2a-mcp/)
