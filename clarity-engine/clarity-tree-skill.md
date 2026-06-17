---
name: clarity-trees
description: >
  Read, propose, and grow Acorn clarity trees soundly. Load this whenever you
  touch a clarity tree — to read it for context, propose typed edits, decompose
  an unclear outcome, or build the work a leaf specifies. It teaches what a
  clarity tree IS and the craft of growing one well; it is not about any single
  Acorn feature.
---

# Working with clarity trees

A clarity tree is a **living specification**: a tree of outcomes that humans author
to drive software into existence, and that agents read, extend, and build against.
Every node is a positive target-state — "the world once this is true" — not a task,
a feature, or a status. Your job is to keep the tree *clear*: each node sound on its
own, the structure carrying the meaning, detail living where it can be evaluated.

This skill encodes craft, not Acorn UI. It must stay true to the ontology below as
that ontology evolves — when the tree's own definitions change, this changes with it.

---

## 1. Ontology — the vocabulary you must use correctly

**A node is a positive target-state outcome** carrying typed *fields*:

- `outcome` — the detailed target-state statement (the node's one-line `content` is
  its headline; the `outcome` field is the fuller "world once this is true").
- `spec` — how this outcome is realized. Optional; lives mostly on leaves (see §4).
- `completionCriteria` — list of `{statement, evaluator, evidence?}` where
  `evaluator ∈ {human, executable, llm}`. The criterion is *how the outcome is judged
  done*, not a description of the work.
- `dependencies` — typed edges to other nodes (see below). Composition is the
  parent→child edge itself; other reliances are typed edges.
- `artifacts` — typed attachments: clarity *inputs* (designs, docs, references that
  sharpen the outcome) and work-product *outputs* (files, PRs, logs the work produced),
  each with a `role` (input / output / executable-test / resource).
- `principle` — an invariant the subtree must not violate (optional; authored where a
  rule must hold, e.g. "humans author intent; agents propose, never silently commit").

**Scope is one of two kinds:**

- **Uncertain** = a branch still being decomposed. Carries a `smallsEstimate` (rough
  size) and `inBreakdown`. It is *not yet buildable* — it exists to be broken down.
- **Small** = a buildable leaf. Carries a `taskList` (the working breakdown, checked
  off as work lands) and an `achievementStatus`.

**Achievement is computed, never a hand-set flag.**
- A *leaf* is Achieved as the recorded consequence of meeting ≥1 completion criterion
  (an executable check passed, a human stamped a human-evaluator criterion, an LLM
  judged it) — carrying its evidence. A bare "done" toggle with nothing behind it is
  wrong by construction.
- A *Small* is Achieved when all its tasks are checked AND its criteria pass.
- A *branch* is Achieved when all children are achieved AND its own criteria pass —
  branch criteria act as integration tests over the children, catching "every child is
  individually done but the assembled whole doesn't work."

**Dependencies are typed — assembly is not the only meaning of an edge:**
- `constituted-from` (composed-of) — the parent is built out of this child. This is the
  hierarchy edge.
- `relies-on-informational` — the node must conform to a standard / spec / protocol it
  does not itself contain (may live in another tree).
- `relies-on-embodied` — the node needs a live carrier to function (a running service,
  a network). Checked at runtime, not build time.

Fluency in this vocabulary is what lets you emit well-formed nodes. When unsure which
field a piece of content is, ask what *judges* it: target-state → `outcome`; how-built →
`spec`; how-judged-done → `completionCriteria`.

---

## 2. Structural invariants — what keeps a tree sound

These are the rules that make the structure *mean* something. Break them and
prioritization and achievement stop rolling up correctly.

1. **Composed-of is an explicit parent→child edge — never prose.** If a node's text
   describes a capability that actually lives in another node, that is a *broken
   dependency*, not a wording problem. Fix by restructuring: if the capability
   *composes* this node, make it a child; if this node *relies on* it, make a typed
   relies-on edge. Never let a node narrate a sibling's capability as if it owned it.

2. **Each node is self-contained.** A node must read as a sensible target-state on its
   own, without its parent or siblings present.

3. **A parent never restates or counts its children.** The children *are* the
   decomposition — repeating them in the parent is duplication, and counting them
   ("composed of three parts") is meaningless, since the count is whatever the tree
   holds. Write the parent as a self-contained outcome; let the edges carry the
   composition. A leaf that narrates a sibling's behavior is the tell-tale of a missing
   composite parent — introduce the parent and push the end-to-end description up to it.

4. **Relies-on is a typed edge, not hierarchy and not prose ownership.** Until typed
   edges are fully surfaced, name a reliance explicitly and minimally
   ("hands off to the draft pipeline") rather than burying it or inflating it into
   false composition.

5. **Sibling order is meaningful — always left-to-right.** Left→right encodes BOTH
   priority and soft-dependency: the leftmost child is the most foundational / first to
   build; a child further right may softly come after those to its left. When adding a
   child, place it by what it depends on among its siblings — don't just append.
   (In the data, higher `siblingOrder` renders leftmost.)

The test to run on every node you author: *"Does my prose mention a capability that
lives in another node?"* If yes — compose it (child) or rely on it (typed edge). Never
leave it as prose.

---

## 3. Decomposition — children that make the parent possible

Decompose an unclear or too-large outcome into children where:

- **Each child is something the parent NEEDS in order to be possible** — read a child
  as "what the parent requires to become true," not "a sub-feature" or "a phase."
- **The children together are sufficient** for the parent. If the parent could be true
  while a child is missing, that child is mis-attached. If the children are all true but
  the parent still isn't, something is missing (often a branch-level integration
  criterion, or a child you haven't named).

**When to decompose** — drive it from readiness, not taste. Break a leaf down when its
readiness is low or a binary blocker is active:
- *gradient signals lowering readiness:* high complexity/uncertainty, a change that
  spans many unrelated areas, a large review surface, open design latitude (unresolved
  design decisions).
- *binary blockers (clamp to not-ready regardless of gradients):* an unresolved open
  unknown, or no completion criterion concrete enough to evaluate.

**When to stop** — when a leaf is a clear, buildable Small: tightly scoped, with at
least one evaluable completion criterion, no open unknowns, design latitude closed.
Reaching small-enough leaves is itself part of achieving clarity — open design and open
unknowns are exactly where decomposition is still hiding.

---

## 4. Where specs and criteria belong

Detail has an altitude. Put it at the right one.

- **Specs live LOW.** Most `spec` detail belongs on the Small leaves that will actually
  be built — that's where it can be precise and acted on.
- **A branch spec shows interaction, not contents.** A branch's spec is *not* a
  restatement of its children. It is a higher-level view of how the parts below fit
  together — typically a flow / sequence / interaction diagram (often an attached
  artifact, not prose). If a branch spec is enumerating its subtree, that's the
  anti-pattern; replace it with the interaction picture.
- **Completion criteria attach wherever they can be evaluated** — on the leaf for a
  unit-level check, on the branch for an integration check over its children. Put the
  criterion where the thing it tests actually becomes observable.
- **High-level nodes stay self-contained, not manifests of their subtree.** A branch
  reads as a target-state in its own right; it does not become a table of contents.

---

## 5. Your working loop against a live tree

You work the tree through a human-approved gate. The loop is plan-mode for tree edits:

1. **Read the live tree for context before proposing.** Read the current nodes, fields,
   typed dependencies, and computed achievement/readiness — work against live state, not
   a stale copy or your memory of an earlier turn.
2. **Propose typed edits as a draft — never a direct write.** Submit an edit set (add /
   update / remove of outcomes, fields, connections). It opens a *draft*: an uncommitted
   overlay on the live tree. Nothing persists from a proposal.
3. **Leave the commit to the human.** Proposed edits are inert until a human reviews,
   edits, and confirms them. You never write to the store directly. This is the
   load-bearing contract — a flow that lets you commit intent without a human decision
   falsifies the whole model.
4. **Record results back onto the nodes you worked.** When you build the work a leaf
   specifies, run that node's machine-evaluable criteria and post back `{pass/fail,
   evidence}`, and attach produced work (files, PRs, logs) as output artifacts. The node
   then holds both the clarity that guided the work and the evidence of the work itself.

**The governing principle:** humans author intent; agents read, propose, evaluate, and
build — but never silently rewrite a node's outcome or spec, and never commit. Everything
you produce is a proposal until a human accepts it.
