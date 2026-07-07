# The Ontology of Clarity

*What the Acorn clarity-tree work embodies, and why it's shaped the way it is.*

---

## The one-sentence version

**Clarity is not a state you reach once — it is a structure you keep alive**, built and
reinforced over time through the interplay of four things: **intent**, **specification**,
**invariance**, and **falsifiability**.

Everything in a clarity tree — every field, every rule, every part of the working loop —
exists to serve one of those four, or to keep them feeding each other.

---

## Why "clarity" and not "project management"

Most tools track *work*: tasks, tickets, statuses, assignments. They answer "what are we
doing and who's doing it?"

A clarity tree jumps up a level and tracks *understanding*. It answers a different question: **what world are
we trying to bring about, and how would we know we're actually there?**

The difference matters because the two come apart constantly. A team can complete every
task and still not have the outcome — the wells are drilled but the village still lacks
water; the tests pass but the feature doesn't do what anyone needed. Task-tracking tools
can't even *express* that failure. A clarity tree is built so that the gap between
"we did the work" and "the world changed" is visible by construction.

---

## The four elements

### 1. Intent — *what do we want, and how will we hold ourselves getting it?*

Humans author intent in two kinds.

An **aim** is intent about *what to bring about*. It enters the tree as an **outcome**:
a positive target-state, written as "the world once this is true" — not a task, not a
feature, not a status. "Community members can transact in the local currency without
help," not "build onboarding flow."

A **commitment** is intent about *how we act while bringing it about*. It enters the
tree as a **principle**, stated on the node where it must hold. A commitment names no
destination; it governs every step toward one — and in doing so it shapes, and
sometimes underlies, what we're willing to aim for at all.

The two have different grammar, and everything downstream follows from it: an aim is
something you **achieve**; a commitment is something you **keep**. An aim sits ahead of
you — approached, reached, and then done. A commitment sits beneath you — held at every
moment, never finished. That difference is why each needs its own kind of verification,
which is where invariance and falsifiability come in below.

Intent, in both kinds, is the one thing only humans author. Everything else in the
system can be proposed, computed, or evaluated by machines; aims and commitments
cannot, because they answer "what do we want, and how do we want to be while getting
it?" — and those questions have no technical answer. Writing them into the tree is
exactly what lets others serve them: an agent holds no aims or commitments of its own —
it works from ours.

### 2. Specification — *how does this become real?*

The **spec**: the concrete shape of how an aim gets realized — the bridge from "the
world once this is true" to buildable work. Specs obey an altitude rule — detail lives
where it can be acted on:

- On buildable leaves, specs are precise: interfaces, formats, behaviors.
- On branches, a spec shows how the parts below *interact* — a flow, a sequence — never
  a restatement of the children's contents. If a branch spec is enumerating its subtree,
  that's the anti-pattern.

A spec that floats too high can't be built from; a spec that sinks too low is repeating
what code will say better. Getting the altitude right is part of the craft.

And every spec answers to the commitments: a design that would break a principle is
inadmissible, however well it serves the aim.

### 3. Invariance — *how do we know an aim is achieved, and stays achieved?*

**Completion criteria** are statements of invariance: each one a statement, an evaluator
(a human, an executable check, or an LLM judgment), and — once evaluated — evidence.
A criterion is *how the outcome is judged done*, never a description of the work.

A criterion is an invariant you can actually **write down and measure**. That's what
makes it powerful, in two tenses:

- **At achievement time, it's the measurement.** A leaf is achieved as the recorded
  consequence of a criterion passing, with the evidence attached. Achievement is
  computed, never a hand-set flag — a bare "done" toggle with nothing behind it is
  wrong by construction.
- **Afterward, it's the guarantee.** An executable criterion can be re-run any time; a
  regression shows up as a statement of invariance that used to pass and now doesn't.
  (This is exactly what a good CI test is: it measures an invariance and complains when
  that statement fails — not a record that the code worked once, but a live guarantee
  that it still does.) Human and LLM criteria are re-checkable the same way: statement
  and evidence sit on the node, so "does this still hold?" is asked against something
  concrete.

Achievement rolls up the tree only because each level below is *guaranteed*, not merely
remembered — and a branch's own criteria guarantee the assembled whole, the integration,
the same way.

One hard rule follows: **an outcome with no evaluable criterion is not yet clear.** If
nothing could show it unmet, you don't yet have an aim — you have a wish. This isn't
philosophy; it's a working gate: a leaf without a concrete criterion is blocked from
being built, full stop.

### 4. Falsifiability — *how do we catch a broken commitment?*

A commitment can't be verified the way an aim can. "The test suite passes" is
measurable. "Humans author intent; agents propose, evaluate, and build — but never
silently commit" is not — **the cases are infinite**. You can't enumerate every flow,
every future feature, every interaction that might break it, so no check can ever
prove it's being kept.

What you *can* do is recognize a break the moment you see one. That is falsifiability
in the strict sense: a claim that can never be proven true, only shown false. A
principle is a commitment written down for exactly this mode of guarding — placed on
the node where it must hold, so that everyone working the subtree, human or agent,
knows what a violation would look like. (The pattern is old: no one has ever produced
a complete definition of justice, yet everyone recognizes injustice on sight.)

The fundamental commitment of this work is the example: no test can certify that
every flow honors "agents never silently commit intent." But the moment a flow appears
that lets an agent commit intent without a human decision, the commitment has been
broken — and you know it on sight.

A falsified principle is not a breakdown of the model; it's the model working. It's the
strongest signal the tree can produce: either the offending work must change, or the
commitment itself must be renegotiated — and renegotiating a commitment is authoring
intent, which is humans' alone.

So the two verification modes divide the territory between them: **invariance for
aims — written down, measured, and guaranteed; falsifiability for commitments — never
proven kept, only caught broken.**

---

## How the four discipline each other

None of the four is sufficient alone, and each one keeps the others honest:

- **Aims without invariance** are wishes — nothing could ever show one has been met,
  or that it still holds.
- **Specification without an aim** is busywork — precisely described work serving no
  target-state anyone chose.
- **Invariance without falsifiability** is measurement theater — every check green
  while the work quietly drifts from its commitments. The measurable part is guarded;
  the infinite part isn't.
- **Falsifiability without invariance** is vigilance with nothing underneath —
  commitments asserted, but nothing concrete ever measured, so everything rests on
  someone happening to notice.

A clarity tree is the data structure that holds all four *in one place, attached to each
other*, so that a weakness in any one of them is visible as a gap in a specific node —
not a vague sense that "the plan feels off."

---

## The shape: a tree of composition, a graph of reliance

Why is this a *tree* at all? Because clarity about a large outcome is built by
decomposition, and decomposition has a natural direction: a parent outcome is
**constituted from** its children. The parent→child edge doesn't mean "sub-task of" or
"filed under" — it means *this outcome is built out of that one*. Each child is
something the parent needs in order to be possible; the children together are
sufficient for it. That's why achievement rolls up along exactly these edges, and why
composition must live as explicit edges rather than prose: the edge *is* the claim
"no parent without this child," and the roll-up computation takes that claim literally.

But not everything an outcome needs is part of it. A node can **require** something it
is not made of — and that's a different edge, in two flavors: it may need to *conform*
to a standard, spec, or protocol it doesn't itself contain (informational — checkable
when you build), or it may need a *live carrier* to function at all — a running
service, a network (embodied — checkable only at runtime). These reliance edges cut
across the hierarchy, and can even reach into other trees, which is what makes the
whole structure a graph laid over the tree. The distinction is the difference between
*part of* and *depends on*: the wheel is part of the car; the road is not — but a car
with no road still doesn't get you anywhere, and whose job the road is belongs to
another tree entirely. Constituted-from carries achievement; requires carries
conformance and availability — things whose failure can break your outcome without
ever being yours to achieve.

---

## Clarity as a process: the loop

This is the key pattern. Clarity isn't achieved at planning time and then consumed at
build time. It is **built, tested, and reinforced continuously** by a loop that runs for
as long as the work is alive:

```
┌─ FALSIFIABILITY — commitments standing guard over the whole loop ───────┐
│   (held as principles where they apply: never proven kept, only         │
│    caught broken — anyone who sees a violation can call it)             │
│                                                                         │
│       AIMS ─────── clear enough to build? ──────► SPECIFICATION         │
│        ▲             no → decompose ↺                    │              │
│        │        (children the parent NEEDS)              │              │
│        │                                                 ▼              │
│  refine aims                                           build            │
│  in light of                                             │              │
│  evidence                                                ▼              │
│        │                                                                │
│        └──── INVARIANCE ◄── evaluate criteria ────── WORK IN THE        │
│              statements of invariance, measured:        WORLD           │
│              {pass/fail, evidence}; executable ones                     │
│              re-runnable as standing guarantees                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

Walking it:

1. **Author intent.** A human writes an aim into the tree as an outcome — and states,
   where needed, the commitments the work must keep.
2. **Test its readiness.** Is this clear enough to build? The signals are concrete:
   open unknowns, unresolved design latitude, no evaluable criterion, a change that
   sprawls across unrelated areas. Any of these means *no*.
3. **Decompose while unclear.** Break the outcome into children — each one something
   the parent *needs* in order to be possible, all of them together *sufficient* for it.
   Reaching small-enough, buildable leaves is not preparation for clarity work; it **is**
   clarity work. Open unknowns are exactly where decomposition is still hiding.
4. **Specify at the leaf.** Once a leaf is tightly scoped with an evaluable criterion,
   give it the precise spec it needs to be built from.
5. **Build, then evaluate.** Do the work, run the criteria, record `{pass/fail,
   evidence}` on the node, attach what was produced (files, PRs, logs) as artifacts.
   The node now holds both the clarity that guided the work *and* the proof of it.
6. **Let achievement roll up — and let it catch integration failures.** A branch is
   achieved only when all its children are achieved *and its own criteria pass*. Branch
   criteria act as integration tests over the children, catching the classic failure:
   every part individually done, assembled whole doesn't work.
7. **Feed evidence back into intent.** Failed criteria, broken commitments,
   surprising evidence, and built reality all reshape the aims above them. Humans
   revise them; the loop runs again.

Every pass through the loop either **reinforces** the tree's clarity (criteria passed,
evidence attached, guarantees confirmed, no commitment broken) or **corrects** it (an
unmet criterion exposes a vague aim, a missing child, a spec at the wrong altitude;
a falsified principle forces a redesign or a renegotiation). Either way, the tree gets
truer. A tree that stops running the loop doesn't stay clear — clarity decays into
stale documentation the moment it stops being tested against the world.

---

## Keeping the structure sound

For the loop to work, the tree's *structure* has to keep meaning what it says. A few
craft rules do that work:

- **Composition is an explicit parent→child edge, never prose.** If a node's text
  describes a capability that actually lives in another node, that's a broken
  dependency, not a wording problem — make it a child (composition) or a typed
  reliance edge, never narration.
- **Every node is self-contained** — a sensible target-state on its own, without its
  parent or siblings present.
- **A parent never restates or counts its children.** The children *are* the
  decomposition; the edges carry it.
- **Reliances are typed edges** — on a standard or spec the node must conform to
  (informational), or on a live carrier it needs at runtime (embodied) — not buried
  assumptions.

One convention worth naming for what it is: **left-to-right sibling order is how
temporal prioritization is expressed in a tree structure** — leftmost is most
foundational, first to build; things further right softly come after. It's a useful,
readable convention for sequencing, nothing more ontological than that.

---

## Who does what: the human–agent contract

The loop is designed to be run by humans and AI agents together, and the division of
labor is itself a stated principle of the tree:

| | Humans | Agents |
|---|---|---|
| **Aims** | Author and revise them | Read them; propose refinements as drafts |
| **Commitments** | Author them; renegotiate them when falsified | Keep them; call out suspected breaks on sight |
| **Specification** | Approve it | Propose it; build from it |
| **Invariance** | Stamp human-evaluator criteria | Run executable checks, post `{pass/fail, evidence}`, flag regressions |

Agents work through a human-approved gate: they read live state, propose typed edits as
an uncommitted draft, and nothing persists until a human reviews and confirms. This
isn't caution for its own sake — it keeps intent, in both kinds, genuinely human while
letting agents do everything else at machine speed.

---

## Quick tests you can run on any node

The whole ontology compresses into four questions. Ask them of any outcome:

1. **Aim** — Does this read as a self-contained target-state ("the world once this
   is true"), sensible without its parent or siblings present?
2. **Specification** — Is the how-it's-built detail at the right altitude — precise on
   leaves, interaction-level on branches?
3. **Invariance** — Is there at least one criterion concrete enough that a human, a
   script, or an LLM could actually judge it — carrying evidence, not just a flag —
   and re-checkable, so a regression would show up as a statement that no longer
   passes?
4. **Commitments** — Are the principles this subtree must keep stated where they
   hold, clearly enough that anyone — human or agent — would recognize a break on
   sight and could call it?

A node that passes all four is clear. A tree whose nodes pass all four, and that keeps
running the loop, *stays* clear.

---

## Where this is headed — aspirations not yet embodied

The ontology above is what the work embodies *so far*. Several extensions are already
articulated — some as uncompleted outcomes in the tree itself, some in the surrounding
thinking — and each one is best understood as deepening one of the four elements:

**Closing the loop at machine speed** *(invariance)*

- **Results flow back into the tree automatically.** An agent that builds what a leaf
  specifies runs that leaf's machine-evaluable criteria and posts `{pass/fail,
  evidence}` back onto the node — the verdict schema and the awaiting-evaluation UI
  exist; the results-back path is still landing. The end state: the tree's guarantees
  refresh themselves as work happens, instead of waiting for someone to remember.
- **An agent performs the work a leaf specifies, on trigger.** The leaf's spec and
  criteria become a complete, self-verifying work order.
- **Build events feed the tree.** Hooks from the development environment (e.g. "the
  test suite went green") update the relevant outcome's criteria — invariance checked
  continuously rather than episodically.

**One clarity surface, many transports** *(specification)*

- **A core API with multiple faces.** The read/propose/evaluate operations as a clean
  library that an MCP server, a CLI, and Holochain zome calls all wrap — build the
  surface once, let any agent or tool speak to it. A discoverable "capability card"
  manifest so an agent can find out what the tree offers before connecting.
- **Typed dependency edges fully surfaced.** Relies-on-informational and
  relies-on-embodied edges exist in the ontology; making them first-class in the UI
  (and across trees) lets reliance be seen and checked, not narrated.

**The same ontology, other renderings** *(intent, made accessible)*

- **Non-visual renderings of the tree.** The primitives — target-states, uncertainty,
  dependency, guaranteed achievement — are culturally universal; the DAG-on-a-canvas
  rendering is not. Outcome trees rendered as structured conversations, voice-first
  interfaces for oral-culture contexts, and community-specific templates that map the
  ontology onto local planning traditions.
- **Clarity for non-software domains.** Development-programme planning, commons
  governance, community-currency design — domains whose central failure mode is
  exactly the task-done-vs-world-changed gap, currently managed in WhatsApp threads
  and spreadsheets that trap the data and lose the reasoning.

**Clarity as shared infrastructure** *(the whole loop, distributed)*

- **A deliberation layer over economic coordination.** Acorn's outcome trees sitting
  above hREA/ValueFlows primitives, so a community decides *what its economic system
  should achieve* — with criteria — before and while building it.
- **Cross-context coordination.** One tree spanning very different conditions: the
  deliberation (decomposing, modelling uncertainty, closing design latitude) happens
  where participants have bandwidth and safety; what flows to people in the field is
  the distilled result — clear priorities, pre-reasoned decisions, contingency
  branches — with the reasoning preserved instead of buried in chat history.
- **Local-first AI in the loop.** Small local models over P2P coordination, so the
  agent side of the human–agent contract runs without cloud dependency — communities
  pool their own inference the way they pool the tree itself.

None of these change the ontology. They extend its reach: more of the loop running at
machine speed, more surfaces speaking to the same structure, more contexts where the
four elements can do their work.

---

## The compact summary

| Element | The question it answers | How the tree embodies it |
|---|---|---|
| **Intent — aims** | What world are we trying to bring about? | `outcome` — positive target-states, human-authored; achieved |
| **Intent — commitments** | How will we act while bringing it about? | `principle` — authored where it must hold; kept |
| **Specification** | How does an aim become real? | `spec` — precise on leaves, interactional on branches |
| **Invariance** | How do we know an aim is achieved — and stays achieved? | `completionCriteria` — measured, evidenced; executable ones re-runnable as standing guarantees |
| **Falsifiability** | How do we catch a broken commitment? | never proven kept, only caught broken — violations recognized on sight, callable by anyone |

And the pattern that binds them: **clarity is a verb**. You don't write a clear plan and
then execute it — you run a loop in which aims are decomposed until they're measurable,
specified until they're buildable, built, judged against explicit statements of
invariance, and revised in light of the evidence — while commitments stand guard over
everything the statements can't reach, waiting to be caught the moment they're broken.
The tree is the living record of that loop: at any moment it shows not just what we
want and how we've bound ourselves in getting it, but how well we currently understand
both — and exactly where our understanding is still thin.
