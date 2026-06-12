/**
 * Generate an importable Acorn clarity tree.
 *
 * TypeScript port of gen_clarity_tree.py, structured so the building blocks
 * (hashing, scope/field/criterion/artifact helpers, NodeDef list, buildProject)
 * can be reused by an in-app tree-generation tool. Running this file directly
 * writes the same JSON the Python script produced.
 *
 * The tree is itself a clarity tree and demonstrates the model it describes:
 *   - content     = the one-sentence outcome (the node's NAME)
 *   - description = the extensible "fields" JSON object, as text. It holds the
 *     detailed outcome statement plus the typed facets (spec, completion
 *     criteria, principle, artifacts, signalType) the future UI renders as widgets.
 *
 * Every node is a POSITIVE target-state outcome. There are no Purpose/Principle/
 * Invariant node *types*: principle is a field; invariance emerges from
 * executable completion criteria that re-run.
 *
 * Run: npx ts-node sample-imports/genClarityTree.ts
 *      (or import { buildProject } from './genClarityTree')
 */

import { createHash } from 'crypto'
import { writeFileSync } from 'fs'
import { join } from 'path'

// --- constants ---------------------------------------------------------------
const AGENT = 'uhCAkCNTp2r_VzOl-MFWDtx0eaP6enod2KsJmwnRx1BwxLXqgLntO'
const PROJECT_TS = 1772322000000 // ms
const BASE_TS = 1772322000 // s

// --- hashing -----------------------------------------------------------------
// Build a valid 53-char Holochain hash string: 'u' + base64url(39 bytes).
// kind is the 3-byte multihash prefix (ActionHash 0x842124 -> "hCkk").
// The 32-byte body and 4-byte DHT location are derived deterministically.
function hash39(kind: Buffer, seed: string): string {
  const body = createHash('sha256').update(seed).digest().subarray(0, 32)
  const loc = createHash('sha256').update('loc:' + seed).digest().subarray(0, 4)
  return 'u' + Buffer.concat([kind, body, loc]).toString('base64url')
}

const AH = Buffer.from([0x84, 0x21, 0x24]) // ActionHash prefix -> "hCkk"
const ah = (seed: string): string => hash39(AH, seed)

// --- types -------------------------------------------------------------------
export type Evaluator = 'human' | 'executable' | 'llm'
export type SignalType = 'gradient' | 'binary blocker'

export interface Criterion {
  statement: string
  evaluator: Evaluator
  evidence?: string
}
export interface Artifact {
  type: string
  label: string
  uri: string
}
/** The extensible "fields" object. Key insertion order = intended widget order. */
export interface Fields {
  outcome: string
  signalType?: SignalType
  spec?: string
  completionCriteria?: Criterion[]
  principle?: string
  artifacts?: Artifact[]
}

export type Scope =
  | { Small: { achievementStatus: 'Achieved' | 'NotAchieved'; targetDate: number | null; taskList: { complete: boolean; task: string }[] } }
  | { Uncertain: { smallsEstimate: number; timeFrame: null; inBreakdown: boolean } }

export interface NodeDef {
  key: string
  parent: string | null
  content: string
  tags: string[]
  scope: Scope
  /** description holds the fields object as pretty JSON text (modification #5) */
  description: string
  hash?: string
}

// --- tags: mark which typed FIELDS a node exercises (convergence made visible) ---
const TAGS: Record<string, string> = {
  Spec: '#0652DD', // node carries a functional spec field
  Completion: '#009432', // node carries completion criteria
  Dependency: '#7f8c8d', // node declares/concerns a typed relation
  Artifact: '#D980FA', // node concerns/holds artifacts
}
const tagHash: Record<string, string> = Object.fromEntries(
  Object.keys(TAGS).map((name) => [name, ah('tag:' + name)])
)

// --- scope / field helpers ---------------------------------------------------
// A task is the working breakdown toward a Small's completion — used like a
// todo list: keep it accurate during implementation and check items off as done.
// Pass a string for an open task, or { task, complete } to track its state.
type TaskInput = string | { task: string; complete: boolean }
function small(tasks: TaskInput[] = [], achieved = false): Scope {
  return {
    Small: {
      achievementStatus: achieved ? 'Achieved' : 'NotAchieved',
      targetDate: null,
      taskList: tasks.map((t) =>
        typeof t === 'string' ? { complete: false, task: t } : { complete: t.complete, task: t.task }
      ),
    },
  }
}

function uncertain(estimate: number, breakdown = true): Scope {
  return { Uncertain: { smallsEstimate: estimate, timeFrame: null, inBreakdown: breakdown } }
}

function crit(statement: string, evaluator: Evaluator, evidence?: string): Criterion {
  const c: Criterion = { statement, evaluator }
  if (evidence !== undefined) c.evidence = evidence
  return c
}

function artifact(type: string, label: string, uri = ''): Artifact {
  return { type, label, uri }
}

/** Build the fields object, preserving the canonical widget key order. */
function fields(f: Fields): Fields {
  const out: Fields = { outcome: f.outcome }
  if (f.signalType !== undefined) out.signalType = f.signalType
  if (f.spec !== undefined) out.spec = f.spec
  if (f.completionCriteria !== undefined) out.completionCriteria = f.completionCriteria
  if (f.principle !== undefined) out.principle = f.principle
  if (f.artifacts !== undefined) out.artifacts = f.artifacts
  return out
}

// --- node registry -----------------------------------------------------------
const N: NodeDef[] = []
function node(key: string, parent: string | null, content: string, tags: string[], scope: Scope, fieldsObj: Fields): void {
  N.push({ key, parent, content, tags, scope, description: JSON.stringify(fieldsObj, null, 2) })
}

// ROOT ------------------------------------------------------------------------
node('root', null,
  'Acorn renders clarity trees whose every node guides an agent toward production-ready software',
  [], uncertain(40),
  fields({
    outcome:
      'Acorn renders clarity trees: every node is a positive target-state outcome carrying typed clarity ' +
      'fields — a detailed outcome statement, an optional functional spec, completion criteria, typed ' +
      'dependencies, and artifacts. An agent consumes the exported tree to build software, and completion ' +
      'verdicts and produced artifacts flow back onto the nodes. The tree is a living specification that ' +
      'stays in sync with the work. (A node is a convergence of typed fields: one built thing satisfies many ' +
      'intents at once.)',
    principle:
      "Humans author intent; agents execute, evaluate, and propose, but never silently rewrite a node's " +
      'outcome or spec. Any flow that lets an agent commit intent without a human decision falsifies this.',
    artifacts: [artifact('doc', 'clarity-notions.md', 'clarity-engine/clarity-notions.md')],
  }))

// BRANCH I: low-friction diff workflow with an LLM agent (interim accelerator) --
// Placed FIRST (leftmost = do-next): it removes the full export/import round-trip
// friction we hit while building everything else.
node('i0', 'root',
  'Working with an LLM agent uses low-friction diff export/import, not full-tree round-trips',
  [], uncertain(4),
  fields({
    outcome:
      'While the rest of the feature set is being built, a human collaborates with an LLM agent on a clarity ' +
      'tree through lightweight diffs rather than exporting and importing whole trees. A human exports the ' +
      'changes since the last export, hands them to an agent, and imports the agent-generated diffs back into ' +
      'the existing tree — with the changed nodes lit up so it is obvious what was worked on. Triggering the ' +
      'agent and seeing what it did is a single click against a known location. (Interim: a lighter-weight ' +
      'form of branch D export + D3/F2 agent proposals.)',
    completionCriteria: [
      // branch integration criterion (dogfoods b5): the whole loop works end to end
      crit('A full loop — export diff, agent edits, import diff, tree lights up — runs end to end with single ' +
        'clicks', 'human'),
    ],
    artifacts: [
      artifact('workproduct', 'AgentDiffTools.tsx — floating Export tree / Apply update buttons (diff vs current, apply, light up)',
        'web/src/components/AgentDiffTools/AgentDiffTools.tsx'),
    ],
  }))

node('i1', 'i0',
  'A human can export the changes since the last export as a diff',
  ['Spec', 'Completion'], small([
    { task: "Persist a 'last export' snapshot at a known location", complete: true },
    { task: 'Compute the delta (added / changed / removed nodes, connections, fields) since the snapshot', complete: true },
    'Write the diff to the known location',
  ]),
  fields({
    outcome:
      'Instead of exporting the whole tree, a human exports only what changed since the previous export — a ' +
      'compact diff of added, modified, and removed nodes, connections, and fields — ready to hand to an agent.',
    spec:
      "Track a 'last export' snapshot; export-diff computes the delta against it and writes the diff out. The " +
      'diff is self-describing enough for an agent to read and for import-diff to apply. DECISION: operate in ' +
      "the live project's hash space (diff live-vs-saved-snapshot, edit that export), so no generator-hash <-> " +
      'live-hash remapping is needed; the generator is only the initial seed.',
    completionCriteria: [
      crit('A human clicks once and gets a diff of only what changed since the last export', 'human'),
      crit('Applying the exported diff to the prior snapshot reproduces the current tree (round-trip)',
        'executable'),
    ],
    artifacts: [
      artifact('workproduct', 'projectDiff.ts — compute/apply diffs + touched-set (pure, 7 tests)',
        'web/src/migrating/projectDiff.ts'),
    ],
  }))

node('i2', 'i0',
  'A human can import LLM-generated diffs into an existing tree',
  ['Spec', 'Completion'], small([
    { task: 'Parse the diff format (shared with export-diff)', complete: true },
    { task: 'Resolve node references against the existing tree; report unresolved', complete: true },
    { task: 'Apply adds / updates / removes in place (zome create/update/delete + ref remap)', complete: true },
  ], true),
  fields({
    outcome:
      "An agent's proposed changes arrive as a diff and are applied onto the existing tree in place — adding, " +
      'updating, and removing the referenced nodes, connections, and fields — without recreating the project.',
    spec:
      'Import-diff reads the same format export-diff produces, resolves references against the existing tree, ' +
      'and applies the changes idempotently. Unresolved references are reported, never silently dropped. The ' +
      'executor is dependency-injected so its ordering + remapping logic is unit-tested without a conductor.',
    completionCriteria: [
      crit("A human clicks once to apply an agent's diff and the existing tree updates in place", 'human'),
      crit('Applying a diff to the tree it was generated against is idempotent and yields the expected nodes',
        'executable'),
    ],
    artifacts: [
      artifact('workproduct', 'applyProjectDiff.ts — zome-level diff executor (create/update/delete + remap), DI + 7 tests',
        'web/src/migrating/applyProjectDiff.ts'),
    ],
  }))

// i3 right-sized into a branch over four independently-built/verified leaves
node('i3', 'i0',
  'Imported diffs light up the tree where changes happened',
  [], uncertain(3),
  fields({
    outcome:
      'After importing a diff, the nodes that changed are highlighted on the map so a human sees at a glance ' +
      'what the agent worked on. Highlighting means making the applied differences visible: a glowy outline ' +
      'marks which nodes changed; a +/- green/red badge shows counts of additions, edits, and deletions; the ' +
      'view fits ALL changed nodes with no particular node selected; and both field changes and leaf checklist ' +
      'changes count. (Right-sized into separate leaves so each is built and verified on its own.)',
  }))

node('i3a', 'i3',
  'Changed nodes show a glowy outline, distinct from selection',
  ['Spec', 'Completion'], small([
    { task: "Add a 'recently changed' ephemeral set (separate from selection)", complete: true },
    { task: 'Render a glow outline for changed nodes in drawOutcome (distinct amber)', complete: true },
    { task: 'Clear it on acknowledge / background click', complete: true },
  ], true),
  fields({
    outcome:
      'After a diff is applied, each touched node renders a transient glowy outline — visually distinct from the ' +
      'normal selection border — so a human sees which nodes the agent changed, with no selection side-effects ' +
      '(no greying, no lingering selection).',
    spec:
      'A dedicated ephemeral set of changed outcome hashes, threaded through selectRenderProps into drawOutcome ' +
      'as a distinct glow (not the selection border), cleared on acknowledge.',
    completionCriteria: [
      crit('Changed nodes glow distinctly; unchanged nodes are unaffected; acknowledging clears it', 'human'),
    ],
  }))

node('i3b', 'i3',
  'A +/- badge shows how many additions, edits, and deletions a diff made',
  ['Spec', 'Completion'], small([
    'Compute add / edit / delete counts from the diff',
    'Render a +/- green/red badge',
  ]),
  fields({
    outcome:
      "The applied diff's change counts render as a +/- green/red badge (e.g. +2 ~1 -0), so the human sees the " +
      'scale of the change, not just where.',
    completionCriteria: [
      crit('The badge shows correct +/~/- counts after an apply', 'human'),
    ],
  }))

node('i3c', 'i3',
  'The view zooms to fit all changed nodes, with none selected',
  ['Spec', 'Completion'], small([
    'Compute the bounding box of the changed nodes from the layout',
    'Set the viewport to fit that box with padding',
    'Select no single node',
  ]),
  fields({
    outcome:
      'After a diff is applied, the viewport zooms/pans to fit ALL changed nodes (their bounding box), with no ' +
      'particular node selected — replacing the pan-to-one that jumped to blank space.',
    completionCriteria: [
      crit('All changed nodes are framed in view; nothing is singled out / selected', 'human'),
    ],
  }))

node('i3d', 'i3',
  'Field changes and leaf checklist changes both count as changed',
  ['Spec', 'Completion'], small([
    { task: 'computeProjectDiff compares the whole outcome (fields + taskList)', complete: true },
  ], true),
  fields({
    outcome:
      'A node counts as changed whether its fields changed or its leaf checklist (tasks) changed — the diff ' +
      'compares the whole outcome, so both register.',
    completionCriteria: [
      crit("Flipping a task's complete flag registers the node as changed", 'executable'),
    ],
  }))

node('i4', 'i0',
  'Export and import are single-click against a known location',
  ['Spec', 'Completion'], small([
    { task: 'Define a known, configurable location for the diff + last-export snapshot', complete: true },
    { task: 'Single-click export-diff and import-diff buttons', complete: true },
    { task: 'No file picker on the common path', complete: true },
  ], true),
  fields({
    outcome:
      'Export-diff and import-diff each happen with a single click, reading and writing a known location, so a ' +
      'human can advance the loop repeatedly — export, run the agent, import — without dialogs or manual file ' +
      'wrangling.',
    spec:
      'A fixed, configurable known location holds the latest diff and the last-export snapshot. Export and ' +
      'import are single buttons; the common path needs no file picker.',
    completionCriteria: [
      crit('A human advances the agent loop by clicking export, running the agent, clicking import — no file ' +
        'dialogs', 'human'),
      crit('Export and import resolve the known location without prompting; the round-trip works headlessly',
        'executable'),
    ],
  }))

node('i5', 'i0',
  "Applying a diff never deletes a node the agent didn't explicitly mark for removal",
  ['Spec', 'Completion'], small([
    'Apply a handed diff directly (explicit adds/updates/removes); never infer deletions',
    'For a full-tree apply, confirm each deletion separately before removing',
    'The agent works in diffs from the latest export, not a stale full tree',
  ]),
  fields({
    outcome:
      'Applying never silently destroys work: a diff is applied exactly as written (only the nodes it names as ' +
      'removed are removed), and a full-tree apply surfaces every implied deletion for explicit confirmation. ' +
      'The agent edits from the latest export, so it never reintroduces stale state. (Learned the hard way: ' +
      'editing a stale full tree once deleted human-added nodes.)',
    spec:
      'Prefer applying handed diffs (explicit deltas). When diffing a full tree against current, treat missing ' +
      'nodes as needing per-deletion confirmation, not automatic removal.',
    completionCriteria: [
      crit('Applying a no-removal diff cannot delete any node; a full-tree apply lists deletions for explicit ' +
        'confirmation', 'human'),
    ],
  }))

// BRANCH A: typed fields (modifications #4, #5) -------------------------------
node('a0', 'root',
  "Every node's content is stored as an extensible set of typed clarity fields",
  ['Spec'], uncertain(4),
  fields({
    outcome:
      "Every node holds its content in an extensible 'fields' object instead of one prose blob. The object " +
      'carries the detailed outcome statement and, as the typology grows, a spec, completion criteria, typed ' +
      'dependencies, and artifacts. A single node legitimately carries several typed fields at once.',
    spec:
      "Introduce a low-level, schema-based, extensible 'fields' JSON object on each node. The current single " +
      'description field is migrated to hold this object. Each field has a type; the schema is open so new ' +
      'field types can be added without changing the node data model.',
    artifacts: [
      artifact('workproduct', 'outcomeFields.ts — fields representation: parseFields / serializeFields with legacy fallback', 'web/src/outcomeFields.ts'),
      artifact('workproduct', 'outcomeFields.test.ts — round-trip + legacy + extensibility (9 passing)', 'web/test/outcomeFields.test.ts'),
    ],
  }))

// a2 is the most-ready leaf and the first to implement — it reuses the existing
// description textarea, now bound to fields.outcome via the OutcomeFields module.
node('a2', 'a0',
  "A node's detailed outcome statement is a field distinct from its one-line name",
  ['Spec', 'Completion'],
  // DONE: tasks checked off as implemented; both completion criteria met -> Achieved
  small([
    { task: 'Bind the editor outcome widget to fields.outcome via parseFields/serializeFields', complete: true },
    { task: 'Route read-sites (search, list) through getOutcomeStatement', complete: true },
    { task: 'Preserve any other fields on save (parse, replace outcome, serialize)', complete: true },
  ], true),
  fields({
    outcome:
      "A node's one-sentence name states the high-level outcome; a separate outcome field holds the fuller " +
      'target-state statement. The map shows the headline; opening the node shows the full statement; the two ' +
      'never collapse into each other. Realized on the OutcomeFields representation (web/src/outcomeFields.ts).',
    spec:
      'content = one-sentence outcome (unchanged). fields.outcome = the detailed target-state statement, read ' +
      'and written through parseFields/serializeFields. Legacy plain-text descriptions migrate to fields.outcome ' +
      'on first parse (handled by parseFields). Other fields are preserved across an outcome edit.',
    completionCriteria: [
      crit('An imported legacy node shows its name on the map and its (migrated) long text as its outcome statement',
        'executable'),
      crit('Editing the outcome statement round-trips: parseFields(description).outcome returns the edited value',
        'executable'),
    ],
  }))

node('a1', 'a0',
  'The outcome editor renders an editable widget for each clarity field',
  ['Spec', 'Completion'], uncertain(2),
  fields({
    outcome:
      'Opening a node shows a distinct, editable widget for each field — the outcome statement as rich text, ' +
      'the spec as text, completion criteria as a list editor, artifacts as an attachment list. Registering a ' +
      'new field type makes its widget appear with no change to the editor core.',
    spec:
      'The fields object is the OutcomeFields shape (web/src/outcomeFields.ts), parsed from and serialized ' +
      'to the description string via parseFields/serializeFields. A field-type registry maps each ' +
      "OutcomeFields key to a widget component; the editor looks up each field's type and renders the " +
      'matching widget, with unknown keys falling back to a raw-JSON widget so nothing is lost.',
    completionCriteria: [
      // branch-level INTEGRATION criterion (dogfoods b5): the two children must compose
      crit('Opening a node with several populated fields shows a correct widget for each, and editing any field ' +
        'round-trips through description', 'human'),
    ],
    artifacts: [artifact('design', 'field-widget mockups')],
  }))

node('a1a', 'a1',
  'The editor binds a markdown widget to each text field, with a registry composing the other field widgets',
  ['Spec', 'Completion'],
  // IN PROGRESS: the outcome (description) field now renders markdown; the rest is open
  small([
    { task: 'Render the outcome (description) field as markdown with click-to-edit', complete: true },
    { task: 'Render the spec field with the same markdown widget', complete: true },
    { task: 'Define a field-type registry so each OutcomeFields key maps to its widget', complete: true },
    { task: 'Route artifacts to the artifacts list editor (branch E)', complete: true },
  ], true),
  fields({
    outcome:
      'Opening a node renders a markdown editor with preview for each text field (outcome, spec) — markdown is ' +
      'the text form across the tree — while a field-type registry maps the remaining keys to their widgets: ' +
      'artifacts to the list editor (branch E), and anything else to the raw-JSON fallback. EvDetails parses ' +
      'description once with parseFields and serializes on change.',
    spec:
      'A field-type registry maps each OutcomeFields key to a widget: text → markdown editor/preview; artifacts ' +
      '→ the artifacts list editor (branch E / e1); unknown → raw-JSON fallback (a1b). Markdown is the only text ' +
      'editor needed now; other editing types can be registered later.',
    completionCriteria: [
      crit('Editing a text field round-trips through description (parseFields returns the edited markdown)',
        'executable'),
      // grounding criterion (the one whose absence let "markdown is already there" go unchecked):
      crit("A description containing '# Heading' and '**bold**' displays a rendered heading and bold text, not " +
        'literal markdown characters', 'human'),
      crit('Outcome and spec each render and edit as their own markdown widget', 'human'),
    ],
    artifacts: [
      artifact('workproduct', 'OutcomeFieldsEditor.tsx — per-field registry + markdown widgets + raw-JSON fallback',
        'web/src/components/OutcomeFieldsEditor/OutcomeFieldsEditor.tsx'),
    ],
  }))

node('a1b', 'a1',
  'Unknown field types fall back to a raw-JSON widget so nothing is lost',
  ['Spec', 'Completion'], small([
    { task: 'Detect field keys with no registered widget', complete: true },
    { task: 'Render those in a raw-JSON editor bound through serializeFields', complete: true },
  ], true),
  fields({
    outcome:
      'A field key with no registered widget renders in a raw-JSON editor bound through serializeFields, so ' +
      'future or unrecognized field types — including completion criteria for now, until a richer criteria ' +
      'editor is registered — stay fully editable and are never dropped.',
    spec:
      'Unknown OutcomeFields keys (and, for now, completionCriteria) fall back to a JSON textarea. Edits ' +
      'serialize back via serializeFields, preserving the extensibility guaranteed by the OutcomeFields index ' +
      'signature.',
    completionCriteria: [
      crit('A node carrying an unrecognized field key shows a raw-JSON widget that round-trips edits', 'human'),
    ],
  }))

node('a3', 'a0',
  'A node carries a functional spec field describing required shape, not just the outcome',
  ['Spec'], small([
    'Add optional fields.spec (text)',
    'Add an optional latitude marker {design | specification | implementation}',
  ]),
  fields({
    outcome:
      'A node can declare a functional spec — the required shape or means — alongside its outcome. The spec ' +
      'sits on a latitude gradient from design through specification to implementation, giving the builder ' +
      'exactly as much freedom as intended. A spec hardened enough to rely on is a standard.',
    spec:
      'Add optional fields.spec (markdown text) plus an optional latitude marker in {design, specification, ' +
      'implementation}, rendered so a reader sees how much freedom the builder is given. Spec text is markdown, ' +
      'like the outcome statement.',
    completionCriteria: [
      crit('A reviewer confirms the spec constrains the means at the intended latitude without ' +
        'over-determining it', 'human'),
    ],
  }))

// BRANCH B: completion criteria at every level; invariance emerges (#6) -------
node('b0', 'root',
  "Completion criteria attached at any node level determine that node's achievement",
  [], uncertain(8),
  fields({
    outcome:
      "Any node — leaf, mid-level, or root — carries completion criteria, and a node's achievement is the " +
      'consequence of those criteria being met (an executable check, a human stamp, or an LLM judgement), ' +
      'not a bare flag set by hand. At a branch the criteria act as integration tests over its children, so ' +
      'achievement at every level is bounded in reality, not merely propagated up from the bottom.',
  }))

node('b1', 'b0',
  'Every completion criterion names an evaluator: human, executable, or LLM',
  ['Spec', 'Completion'], small([
    'Criterion schema {statement, evaluator, evidence}',
    'Executable evaluator runs a command/url and captures evidence',
    'Human evaluator exposes a stamp/approve affordance',
    'LLM evaluator submits statement + artifact for judgement',
  ]),
  fields({
    outcome:
      'Each completion criterion records who or what judges it — a human with a stamp, an executable check, ' +
      'or an LLM — so anyone reading the node knows exactly how it will be verified. Executable criteria are ' +
      'the ones an agent can run unattended.',
    spec:
      'fields.completionCriteria = list of {statement, evaluator ∈ {human, executable, llm}, evidence?}. ' +
      'Executable criteria carry enough detail (command or url + expected result) to run without a human.',
    completionCriteria: [
      crit("An agent reads a leaf's executable criterion, runs it, and reports pass/fail with captured " +
        'evidence', 'executable'),
      crit('A human-evaluator criterion presents a stamp/approve affordance', 'human'),
    ],
  }))

node('b4', 'b0',
  'A leaf becomes Achieved as the recorded consequence of meeting a completion criterion, not a bare human toggle',
  ['Spec', 'Completion'], small([
    'A leaf cannot be Achieved without at least one met completion criterion as its basis',
    'Record which criterion (and its evidence) grounded the achievement',
    "Human 'mark done' becomes evaluating a manual-review criterion, not a contentless flag",
  ]),
  fields({
    outcome:
      'A leaf is Achieved because a completion criterion was met — an executable check passed, a human ' +
      'stamped a manual-review criterion, or an LLM judged it — and the achievement is the recorded ' +
      "consequence of that evaluation, carrying its evidence. The old bare 'achieved' flag, set by hand with " +
      'nothing behind it, is replaced: marking a leaf done means satisfying at least one criterion, so ' +
      'achievement is bounded in reality rather than asserted.',
    spec:
      'Achievement is derived: status becomes Achieved only when >=1 completion criterion is met, and stores ' +
      'a reference to the grounding criterion plus its evidence. A human stamp is the human-evaluator path of ' +
      'a criterion, not a separate flag.',
    completionCriteria: [
      crit('A leaf with no met completion criterion cannot be shown Achieved', 'executable'),
    ],
  }))

node('b7', 'b0',
  "A Small's achievement follows from its tasks being checked and its criteria met, not an independent toggle",
  ['Spec', 'Completion'], small([
    'Surface the task list as the editable working breakdown (todos) on each Small',
    'Compute Achieved from all-tasks-checked AND completion-criteria-met',
    'Stop allowing an independent achieved toggle that bypasses tasks and criteria',
  ]),
  fields({
    outcome:
      "A Small's task list is its working breakdown — the path to completion, maintained like a todo list and " +
      'checked off as the work lands. Achievement is not an independent flag: a Small reaches Achieved only when ' +
      'its tasks are all checked and its completion criteria are met. Tasks are the path, completion criteria are ' +
      'the proof, achievement is the result of both.',
    spec:
      'Couple the three facets: taskList (the breakdown), completionCriteria (the proof), and achievementStatus ' +
      '(the result). A Small becomes Achieved when all its tasks are complete AND its criteria pass — derived ' +
      'from those inputs rather than set directly (ties to b4 and the computed results in b6).',
    completionCriteria: [
      crit('A Small with unchecked tasks or an unmet criterion cannot be shown Achieved', 'executable'),
      crit('Checking the last task and meeting the criteria flips the Small to Achieved with no separate toggle',
        'human'),
    ],
  }))

node('b5', 'b0',
  'Branch nodes carry integration-test completion criteria that ground their achievement, not just propagation',
  ['Spec', 'Completion'], small([
    'A branch can author its own completion criteria (often executable integration tests over its children)',
    "Branch achievement = children propagation AND the branch's own criteria passing",
    "Flag the case where all children are achieved but the branch's integration criterion fails",
  ]),
  fields({
    outcome:
      'A branch node is not Achieved merely because all its children are. It carries its own completion ' +
      "criteria — integration tests over the children's combined result — that must also pass. Achievement " +
      'at a branch is bounded in reality by these integration criteria in addition to upward propagation, ' +
      'catching the case where every child is individually done but the assembled whole does not yet work.',
    spec:
      'Computed achievement at a branch = (all children achieved) AND (the branch\'s own completion criteria ' +
      'pass). Integration criteria are ordinary completion criteria authored at the branch, usually executable.',
    completionCriteria: [
      crit('A branch with all children achieved but a failing integration criterion is not shown achieved',
        'executable'),
    ],
  }))

node('b2', 'b0',
  'Executable completion criteria re-run to keep prior outcomes provably intact',
  ['Completion'], small([
    'Re-run executable criteria when the work changes',
    'Surface a newly-failing criterion as red on its node',
    'Tint the ancestors of a red node',
  ]),
  fields({
    outcome:
      'Executable completion criteria are re-run as the work evolves, so an outcome once achieved stays ' +
      'provably intact. When a later change breaks a previously-passing criterion, its node surfaces red. ' +
      'Invariance is not a separate declaration — it is the standing guarantee the re-run completion tests ' +
      'provide.',
    completionCriteria: [
      crit('A previously-passing executable criterion fails after a breaking change and its node surfaces red ' +
        'up the branch', 'executable'),
      crit('Re-running all criteria after an unrelated change leaves green nodes green', 'executable'),
    ],
  }))

node('b3', 'b0',
  'Each node displays its completion verdicts, which roll up into computed achievement',
  ['Spec', 'Completion'], small([
    "Render each criterion's verdict on the node",
    'Fold criterion pass/fail into computed-achievement propagation',
  ]),
  fields({
    outcome:
      "Every node shows its current completion verdicts on the map, and those verdicts compose with Acorn's " +
      "existing achievement propagation so a parent's status reflects both its children and its own criteria.",
    spec:
      "Render each criterion's verdict on the node. Fold criterion pass/fail into the computed-achievement " +
      'calculation already used for Small/Uncertain scopes.',
    completionCriteria: [
      crit("Map view shows each node's criteria with current verdict; a failing criterion is visible at a " +
        'glance', 'human'),
    ],
  }))

// b6 (relocated from branch A): the computed/derived side that drives node color
node('b6', 'b0',
  'A node stores computed evaluation results separately from its authored fields, and they drive its color',
  ['Spec', 'Completion'], small([
    'Cache computed results (achievement, completion verdicts, smallness readiness) on the node',
    'Recompute a result when its input fields/verdicts change',
    'Map computed results to color/visual state, never to an editable widget',
  ]),
  fields({
    outcome:
      'A node stores two separable things: its authored fields — outcome, spec, completion criteria, ' +
      'dependencies, artifacts, the things people and agents set — and its computed evaluation results: ' +
      'achievement, completion verdicts, and smallness readiness, which are cached values recomputed from ' +
      "those inputs. The computed results drive the node's color; no one sets them by hand.",
    spec:
      'Alongside fields.* (authored), a node caches computed.* (derived). Computed values are read-only to the ' +
      'editor, recomputed when their inputs change, and mapped to color/visual state rather than to widgets.',
    completionCriteria: [
      crit('Editing an authored field recomputes the dependent computed values; computed values are not ' +
        'user-editable', 'executable'),
    ],
  }))

// BRANCH C: typed dependencies ------------------------------------------------
node('c0', 'root',
  'Every dependency declares which of three relation types it is',
  ['Dependency'], uncertain(4),
  fields({
    outcome:
      'Every connection in the tree declares its relation type, so a reader or agent can tell assembly from ' +
      'reliance at a glance. The three types are constituted-from, informational reliance, and embodied ' +
      'reliance.',
    spec:
      'A connection gains a relationType ∈ {constituted-from, relies-on-informational, relies-on-embodied}. ' +
      'The three render distinctly on the map and are independently queryable.',
  }))

node('c1', 'c0',
  'Assembly is expressed as a constituted-from relation between a parent and its children',
  ['Dependency'], small([
    'Existing connections import as constituted-from relations',
    'constituted-from is the default relation type',
  ]),
  fields({
    outcome:
      'A parent built out of its children declares a constituted-from relation. This is the assembly relation ' +
      "today's outcome tree already encodes; it becomes one explicit, named relation type rather than the " +
      'only possible meaning of an edge.',
    completionCriteria: [
      crit('Every existing connection imports as a constituted-from relation', 'executable'),
    ],
  }))

node('c2', 'c0',
  'Conformance to an external standard is expressed as an informational reliance relation',
  ['Dependency'], small([
    'A node can point at a spec/standard (in- or cross-tree) as an informational reliance',
    'Informational reliance renders distinctly from constituted-from',
  ]),
  fields({
    outcome:
      'A node that must conform to a standard, protocol, or spec it does not itself contain declares an ' +
      'informational reliance on it. The referenced standard may live outside this tree, and the relation ' +
      'renders distinctly from assembly.',
    completionCriteria: [
      crit('A node declares an informational reliance on a spec node (in- or cross-tree) and the edge renders ' +
        'distinctly', 'human'),
    ],
  }))

node('c3', 'c0',
  'Runtime carriers a node needs are expressed as embodied reliance relations',
  ['Dependency', 'Completion'], small([
    'A node lists the live carriers it relies on',
    "An agent can query a node's embodied reliances and health-check each",
  ]),
  fields({
    outcome:
      'A node that needs a live carrier to function — a running service, a network, a Holo-fuel instance — ' +
      'declares an embodied reliance on it. This is the relation an agent checks at runtime rather than build ' +
      'time.',
    completionCriteria: [
      crit("An agent queries a node's embodied reliances and health-checks each carrier, reporting which are " +
        'live', 'executable'),
    ],
  }))

node('c4', 'c0',
  'Adding a second parent to a node is the moment Acorn asks: composed-of or relies-on?',
  ['Dependency', 'Spec', 'Completion'], small([
    'On creating a connection that gives a child more than one parent, prompt for the relation type',
    'Offer composed-of (constituted-from) vs relies-on; for relies-on, informational vs embodied',
    'Default the first/assembly parent to composed-of; store the chosen type on the connection',
  ]),
  fields({
    outcome:
      'When a node gains an additional parent — a multi-parent connection — the act of creating that edge is ' +
      'the moment Acorn asks whether the new parent composes the node (constituted-from) or the node relies ' +
      'on it (a reliance, informational or embodied). The relation type is captured at creation, not inferred ' +
      'later, so multi-parent structure carries its meaning from the start.',
    spec:
      'On creating a connection that gives a child more than one parent, present a relation-type choice: ' +
      'composed-of vs relies-on; if relies-on, informational vs embodied. The primary/assembly parent ' +
      'defaults to composed-of (branch C1).',
    completionCriteria: [
      crit('Adding a second parent surfaces the relation-type prompt and the chosen type is stored on the ' +
        'connection', 'human'),
    ],
  }))

// BRANCH D: living tree / agent loop -----------------------------------------
node('d0', 'root',
  'Agents build from the exported clarity tree and their results return into it',
  [], uncertain(4),
  fields({
    outcome:
      'Humans think in the clarity tree; agents read the exported specification, build against it, and post ' +
      'completion verdicts and produced artifacts back onto the nodes. The loop between deliberation and ' +
      'execution is tight and visible — the tree stays alive.',
  }))

node('d1', 'd0',
  'Acorn exports a clarity tree as a deterministic, agent-consumable specification',
  ['Spec', 'Completion'], small([
    'Define a clarity-spec export schema',
    "Flatten each node's typed fields into the export",
    'Round-trip test: export then re-import yields an equivalent tree',
  ]),
  fields({
    outcome:
      "Acorn produces a deterministic export that flattens each node's typed fields — outcome, spec, " +
      'completion criteria, typed dependencies, and artifacts — into a specification document an agent ' +
      'consumes directly and round-trips back.',
    spec:
      'Export validates against a published clarity-spec schema and round-trips to an equivalent tree. Field ' +
      'types unknown to the exporter are passed through verbatim.',
    completionCriteria: [
      crit('Export is valid against the clarity-spec schema and round-trips to an equivalent tree', 'executable'),
    ],
  }))

node('d2', 'd0',
  'Agents post completion verdicts with evidence back onto the nodes they worked',
  ['Completion'], small([
    'API to post a verdict {pass/fail, evidence} to a node',
    'Flip node status on a passing executable criterion',
  ]),
  fields({
    outcome:
      'An agent that finishes work on a node runs that node\'s machine-evaluable criteria and writes back ' +
      '{pass/fail, evidence}; the node\'s status flips on a passing executable criterion. The agent is the fly ' +
      'on the wall.',
    completionCriteria: [
      crit('For a sample leaf, an agent returns pass with captured command output and the node flips to ' +
        'achieved', 'executable'),
    ],
  }))

node('d3', 'd0',
  'Agents propose new typed outcomes and fields that humans approve in Acorn',
  ['Spec', 'Completion'], small([
    'Agent can propose a missing outcome / spec / dependency / criterion as pending',
    'Human approves / modifies / rejects each proposal in the Acorn UI',
  ]),
  fields({
    outcome:
      'When an agent discovers a missing outcome, spec, dependency, or criterion during execution, it ' +
      'proposes a typed node or field; a human approves, modifies, or rejects it in Acorn. The locus of ' +
      'decision stays human.',
    spec:
      'Agent proposals appear as pending typed nodes/fields and a human resolves each through the Acorn UI.',
    principle:
      'Humans author intent; agent proposals are inert until a human accepts them. A proposal that merges ' +
      'without human review falsifies this.',
    completionCriteria: [
      crit('An agent-proposed spec node appears as a pending suggestion and a human resolves it', 'human'),
    ],
  }))

// BRANCH E: artifacts (modification #7) --------------------------------------
node('e0', 'root',
  'Every node holds a list of typed artifacts in place of a single GitHub link',
  ['Artifact'], uncertain(3),
  fields({
    outcome:
      'Each node carries a list of typed artifacts serving two purposes: clarity inputs (designs, reference ' +
      'docs, mockups, links) that sharpen the outcome, and workproduct outputs (files, PRs, build logs) that ' +
      'agents produce. The legacy single GitHub link becomes one artifact of type github.',
    spec:
      'Replace the single githubLink string with fields.artifacts = list of {type, label, uri}. Artifact ' +
      'types are open/extensible; github is one type. Migration moves any existing githubLink into the list.',
  }))

node('e1', 'e0',
  'Clarity-input artifacts such as designs, docs, and references attach to any node',
  ['Artifact'], small([
    { task: 'Attach typed reference artifacts (design, doc, url, mockup) to a node', complete: true },
    { task: 'Render artifacts as a labelled attachment list in the node editor', complete: true },
  ], true),
  fields({
    outcome:
      'Any node can hold reference artifacts that increase its clarity — a design file, a spec document, a ' +
      'mockup, an external link — each typed and labelled, and rendered as an attachment list in the node ' +
      'editor.',
    completionCriteria: [
      crit('A user attaches a design and a reference URL to a node and both render as typed artifacts', 'human'),
    ],
    artifacts: [
      artifact('workproduct', 'ArtifactsField.tsx — typed artifacts list editor (add/edit/remove, openable links)',
        'web/src/components/OutcomeFieldsEditor/ArtifactsField.tsx'),
    ],
  }))

node('e2', 'e0',
  'Agents attach their workproduct to nodes as output artifacts',
  ['Artifact', 'Completion'], small([
    'Artifact API accepts agent-produced outputs (file, PR, log)',
    'UI distinguishes input artifacts from output workproduct',
  ]),
  fields({
    outcome:
      'An agent that produces work — a file, a pull request, a build log — attaches it to the relevant node ' +
      'as an output artifact, so the node holds both the clarity that guided the work and the evidence of the ' +
      'work itself.',
    completionCriteria: [
      crit('An agent attaches a produced file or PR url to a node as a workproduct artifact and it renders in ' +
        'the UI', 'executable'),
    ],
    artifacts: [artifact('workproduct', 'example: PR link produced by an agent')],
  }))

// BRANCH F: in-app AI-assisted chat for tree construction (modification #8) ---
node('f0', 'root',
  'An in-app AI chat panel lets people build and refine clarity trees in conversation',
  [], uncertain(4),
  fields({
    outcome:
      'Acorn includes an AI-assisted chat panel where a person and an assistant converse to construct and ' +
      'refine a clarity tree — the very conversation that produced this tree, now happening inside the app. ' +
      'Deliberation, drafting, and editing all occur in one place, against the live tree.',
  }))

node('f1', 'f0',
  'The chat assistant sees the live tree as context on every exchange',
  ['Spec', 'Completion'], small([
    'Inject the current project\'s tree state into the assistant context each turn',
    'Reuse the agent-consumable export (branch D) as the context payload',
  ]),
  fields({
    outcome:
      'Every message the assistant receives includes the current project\'s tree — nodes, fields, typed ' +
      'dependencies, and achievement — so its suggestions are grounded in the actual state rather than a ' +
      'stale copy.',
    spec:
      "The chat injects the queryable/exported tree state (branch D) into the assistant's context on each " +
      'turn, refreshed after any edit.',
    completionCriteria: [
      crit("After a human edits the tree, the assistant's next turn reflects the change", 'executable'),
    ],
  }))

node('f2', 'f0',
  'The assistant drafts and applies typed tree edits from the conversation, pending human approval',
  ['Spec', 'Completion'], small([
    'Assistant drafts concrete edits: new outcomes, field values, typed dependencies',
    'Edits surface as pending proposals via the same path agents use (branch D3)',
    'Human accepts / modifies / rejects each edit inline in the chat',
  ]),
  fields({
    outcome:
      'From the conversation the assistant drafts concrete edits — new outcomes, field values, typed ' +
      'dependencies — and applies them on human approval, reusing the same proposal/approval path that ' +
      'execution agents use.',
    spec:
      'Chat-proposed edits surface as pending typed nodes/fields; the human accepts, modifies, or rejects ' +
      'each inline. Accepted edits are written to the tree like any other proposal.',
    principle:
      'Humans author intent; assistant-drafted edits are inert until a human accepts them.',
    completionCriteria: [
      crit('A user asks for a new branch in chat, approves it, and it appears in the tree', 'human'),
    ],
  }))

node('f3', 'f0',
  'The conversation that shaped a branch is retained as an artifact on that branch',
  ['Artifact', 'Completion'], small([
    'Attach the chat transcript to the branch it produced or refined',
    'Store it as an artifact of type conversation (branch E)',
  ]),
  fields({
    outcome:
      'The chat transcript that produced or refined a branch is attached to that branch as a clarity-input ' +
      'artifact, so the reasoning behind the outcomes stays with them and is available to later readers and ' +
      'agents.',
    completionCriteria: [
      crit('Attaching a conversation to a node produces an artifact of type conversation that renders in the ' +
        'UI', 'executable'),
    ],
    artifacts: [artifact('conversation', 'this tree-construction conversation')],
  }))

// BRANCH G: smallness readiness — a computed gradient clamped by binary blockers
node('g0', 'root',
  "A leaf's readiness to be a Small is computed from its clarity signals, not declared by hand",
  [], uncertain(8),
  fields({
    outcome:
      "Smallness is a clarity threshold, not a guess and not something a person sets by hand. A leaf's " +
      'readiness to be a Small is computed from multiple signals and cached on the node, because the more ' +
      'complex a bottom-level item is, the less likely anyone is clear about it. Most signals are genuine ' +
      "gradients — how complex, how wide the agent's change, how large the review surface, how much design " +
      'latitude is still open. A few are binary blockers — an unresolved unknown, no evaluable criterion — ' +
      'that veto readiness outright. Reaching small-enough leaves is itself part of achieving clarity.',
  }))

node('g1', 'g0',
  "Each leaf's smallness readiness is a cached gradient, recomputed from its signals and rendered as the leaf's color",
  ['Spec', 'Completion'], small([
    'Aggregate the readiness signals into a 0..1 gradient',
    'Clamp the gradient to not-ready when any binary blocker is active',
    "Recompute on input change and map the result to the leaf's color ramp",
  ]),
  fields({
    outcome:
      "A leaf's smallness readiness is a single cached value on the node — an instance of the node's computed " +
      'results (the computed-results outcome b6 in branch B), not an authored field. It aggregates the readiness ' +
      'signals into a gradient and is ' +
      "rendered as the leaf's color, so one glance across the map shows which leaves are clear enough to build " +
      'and which still need breakdown. Any active binary blocker clamps the gradient to not-ready regardless ' +
      'of the other signals.',
    spec:
      'computed.smallReadiness = aggregate(gradient signals) in 0..1, clamped to 0 by any active binary ' +
      'blocker. Recomputed when its input fields/verdicts change and mapped to a color ramp on the leaf.',
    completionCriteria: [
      crit('Changing a signal recomputes the cached readiness and updates the leaf color; an active binary ' +
        'blocker forces the not-ready color', 'executable'),
    ],
  }))

node('g2', 'g0',
  "A leaf's complexity estimate is a gradient input to its readiness",
  ['Spec', 'Completion'], small([
    'Surface a continuous complexity/uncertainty estimate on every leaf',
    'Feed the estimate into computed.smallReadiness; mark the breakdown threshold',
  ]),
  fields({
    outcome:
      'Every leaf shows a complexity/uncertainty estimate — the agile-style signal — as a real gradient. A ' +
      'higher estimate lowers readiness and, past the breakdown threshold, pushes the leaf toward ' +
      'decomposition; a low estimate, roughly one small unit, raises readiness.',
    signalType: 'gradient',
    spec:
      'Extend smallsEstimate into a continuous contribution to computed.smallReadiness; surface the estimate ' +
      'and the breakdown threshold on the leaf.',
    completionCriteria: [
      crit('A higher complexity estimate measurably lowers the cached readiness gradient', 'executable'),
    ],
  }))

node('g3', 'g0',
  'The spread of the change a building agent would make is a gradient input to readiness',
  ['Completion'], small([
    'Estimate the change-spread for the building agent',
    'Feed change-spread into computed.smallReadiness proportionally',
  ]),
  fields({
    outcome:
      'The estimated spread of the change a building agent would make is a gradient input to readiness: a ' +
      'tightly-scoped single change set reads as ready; a change spanning many unrelated areas lowers ' +
      'readiness and suggests a split.',
    signalType: 'gradient',
    completionCriteria: [
      crit("An agent's scope-spread assessment contributes proportionally to the readiness gradient",
        'executable'),
    ],
  }))

node('g4', 'g0',
  'The size of the human review surface is a gradient input to readiness',
  ['Completion'], small([
    'Surface the review surface of a leaf against its completion criteria',
    'Feed review-surface size into computed.smallReadiness',
  ]),
  fields({
    outcome:
      'The size of the review surface — how much a reviewer must hold in mind to verify the finished leaf ' +
      'against its criteria — is a gradient input to readiness. A leaf reviewable in one sitting reads as ' +
      'ready; a larger surface lowers readiness.',
    signalType: 'gradient',
    completionCriteria: [
      crit("A reviewer's single-sitting assessment maps onto the readiness gradient", 'human'),
    ],
  }))

node('g5', 'g0',
  'How much design latitude is still open in the spec is a gradient input to readiness',
  ['Spec', 'Completion'], small([
    "Map the spec's latitude marker and count of open decisions (branch A3) to a contribution",
    'Lower readiness for each unresolved design decision',
  ]),
  fields({
    outcome:
      "How much design latitude remains open in the leaf's spec is a gradient input to readiness: a spec at " +
      'implementation latitude with no open choices reads as ready; each unresolved design decision lowers ' +
      'readiness, because open design hides decomposition.',
    signalType: 'gradient',
    spec:
      "Map the spec's latitude marker and its count of open decisions (branch A3) to a readiness contribution.",
    completionCriteria: [
      crit('Reviewer-confirmed open design decisions lower the readiness gradient', 'human'),
    ],
  }))

node('g6', 'g0',
  'The absence of any evaluable completion criterion is a binary blocker on readiness',
  ['Completion'], small([
    'Detect when a leaf has zero criteria concrete enough to evaluate',
    'Clamp readiness to not-ready until a concrete criterion exists',
  ]),
  fields({
    outcome:
      'A leaf with no completion criterion concrete enough to evaluate is, by definition, not yet clear — so ' +
      'the absence of any evaluable criterion is a binary blocker that clamps readiness to not-ready, whatever ' +
      'the gradient signals say.',
    signalType: 'binary blocker',
    completionCriteria: [
      crit('A leaf with zero evaluable criteria shows the not-ready color until a concrete criterion is added',
        'human'),
    ],
  }))

node('g7', 'g0',
  'An unresolved open unknown is a binary blocker on readiness',
  ['Completion'], small([
    'Record a leaf\'s open known-unknowns, with room to flag suspected unknown-unknowns',
    'Clamp readiness to not-ready while any unknown is unresolved',
  ]),
  fields({
    outcome:
      'An unresolved open unknown is exactly where clarity is missing, so any unresolved known-unknown on a ' +
      'leaf is a binary blocker: readiness is clamped to not-ready until the unknown is resolved or moved into ' +
      'a child outcome. (Room remains to flag suspected unknown-unknowns.)',
    signalType: 'binary blocker',
    completionCriteria: [
      crit('A leaf with a recorded open unknown stays not-ready until it is resolved or pushed into a child ' +
        'outcome', 'human'),
    ],
  }))

node('g8', 'g0',
  "When a leaf's readiness is low or blocked, the assistant proposes a decomposition into smaller outcomes",
  ['Spec', 'Completion'], small([
    'Trigger on low readiness or an active binary blocker',
    'Assistant drafts candidate child outcomes that each look more ready',
    'Proposed decompositions use the human-approval path (branches D3/F2)',
  ]),
  fields({
    outcome:
      "When a leaf's readiness is low or a binary blocker is active, the AI assistant proposes a concrete " +
      'decomposition — child outcomes that each look more likely to be ready — for the human to approve. ' +
      'Reaching small-enough leaves becomes a guided, conversational step of achieving clarity.',
    spec:
      'On low readiness or an active blocker, the assistant (branch F) drafts child outcomes and surfaces them ' +
      'via the proposal/approval path (branches D3/F2).',
    principle:
      'Humans author intent; proposed decompositions are inert until a human accepts them.',
    completionCriteria: [
      crit('A low-readiness or blocked leaf yields an assistant-proposed breakdown the human can accept, ' +
        'modify, or reject', 'human'),
    ],
  }))

// BRANCH H: cross-cutting, high-level, low-priority — held but not yet decomposed
// (rightmost = lowest priority in the left-to-right completion order)
node('h0', 'root',
  'Multi-user co-editing works seamlessly across all changes',
  [], uncertain(0, false),
  fields({
    outcome:
      'Every change a person can make to a clarity tree — editing any field, restructuring nodes, attaching ' +
      'artifacts, marking completion — works under real-time multi-user co-editing without clobbering, lost ' +
      'updates, or stale views. Held high-level and low-priority for now: a standing concern, not yet decomposed ' +
      "into smalls. Today's per-description editing presence is the seed to generalize across every field and edit.",
  }))

// --- assemble the importable project ----------------------------------------
export interface BuiltProject {
  projectMeta: Record<string, unknown>
  outcomes: Record<string, unknown>
  connections: Record<string, unknown>
  outcomeMembers: Record<string, unknown>
  outcomeComments: Record<string, unknown>
  entryPoints: Record<string, unknown>
  tags: Record<string, unknown>
}

export function buildProject(nodes: NodeDef[] = N): BuiltProject {
  const outcomes: Record<string, unknown> = {}
  nodes.forEach((n, i) => {
    const h = ah('node:' + n.key)
    n.hash = h
    outcomes[h] = {
      content: n.content,
      creatorAgentPubKey: AGENT,
      editorAgentPubKey: null,
      timestampCreated: BASE_TS + i,
      timestampUpdated: null,
      scope: n.scope,
      tags: n.tags.map((t) => tagHash[t]),
      description: n.description,
      isImported: true,
      githubLink: '',
      actionHash: h,
    }
  })

  // Acorn convention: HIGHER siblingOrder renders further LEFT, and the tree is
  // completed left-to-right (leftmost first). nodes are authored in intended
  // order per parent, so assign DESCENDING siblingOrder: first -> highest -> left.
  const connections: Record<string, unknown> = {}
  const childrenByParent = new Map<string, string[]>()
  for (const n of nodes) {
    if (n.parent !== null) {
      const list = childrenByParent.get(n.parent) ?? []
      list.push(n.key)
      childrenByParent.set(n.parent, list)
    }
  }
  const hashOf = (key: string): string => nodes.find((x) => x.key === key)!.hash!
  let i = 0
  for (const [parentKey, childKeys] of childrenByParent) {
    const parentHash = hashOf(parentKey)
    const count = childKeys.length
    childKeys.forEach((childKey, pos) => {
      const so = count - 1 - pos
      const ch = ah('conn:' + parentKey + '->' + childKey)
      connections[ch] = {
        parentActionHash: parentHash,
        childActionHash: hashOf(childKey),
        siblingOrder: so,
        randomizer: PROJECT_TS + i,
        isImported: true,
        actionHash: ch,
      }
      i += 1
    })
  }

  const tags: Record<string, unknown> = {}
  for (const [name, color] of Object.entries(TAGS)) {
    const h = tagHash[name]
    tags[h] = { actionHash: h, backgroundColor: color, text: name }
  }

  return {
    projectMeta: {
      creatorAgentPubKey: AGENT,
      createdAt: PROJECT_TS,
      name: 'Acorn → Clarity Trees (living spec)',
      image: '',
      passphrase: 'clarity tree typed fields living specification',
      isImported: true,
      layeringAlgorithm: 'CoffmanGraham',
      topPriorityOutcomes: [],
      isMigrated: null,
      actionHash: ah('projectMeta:clarity-trees'),
    },
    outcomes,
    connections,
    outcomeMembers: {},
    outcomeComments: {},
    entryPoints: {},
    tags,
  }
}

/** Sanity-check the built project the same way the Python script did. */
export function validate(project: BuiltProject): void {
  const allHashes = new Set(Object.keys(project.outcomes))
  for (const c of Object.values(project.connections) as any[]) {
    if (!allHashes.has(c.parentActionHash) || !allHashes.has(c.childActionHash)) {
      throw new Error('connection references a missing outcome')
    }
  }
  for (const o of Object.values(project.outcomes) as any[]) {
    for (const t of o.tags) {
      if (!(t in project.tags)) throw new Error('outcome references a missing tag')
    }
    if (o.actionHash.length !== 53) throw new Error(`bad hash length ${o.actionHash.length}`)
    JSON.parse(o.description) // description must be valid JSON (the fields object)
  }
}

// --- run directly ------------------------------------------------------------
if (require.main === module) {
  const project = buildProject()
  validate(project)
  const outPath = join(__dirname, 'acorn-clarity-trees.json')
  writeFileSync(outPath, JSON.stringify(project, null, 2))
  console.log(`wrote ${outPath}`)
  console.log(
    `nodes=${Object.keys(project.outcomes).length} ` +
      `connections=${Object.keys(project.connections).length} ` +
      `tags=${Object.keys(project.tags).length}`
  )
  console.log('all checks passed')
}
