# Referring to a clarity-tree node

A node has several ways to be named. Some are **stable identity** — they survive the
tree being rearranged — and some are **casual** — convenient while talking, but they
break the moment the structure changes. Only stable identity is ever stored as a
node's identity.

## Stable referents (resolve through one canonical identity)

The canonical identity is the content-addressed **`actionHash`** — stable by
construction. Every other stable referent resolves down to it:

| Referent      | What it is                                              | Example                          |
| ------------- | ------------------------------------------------------- | -------------------------------- |
| `actionHash`  | the canonical, content-addressed identity               | `uhCkk0ZVQBP7RIyx…`              |
| `hashCodeId`  | the 6-digit short rendering of the `actionHash`         | `200172`                         |
| `handle`      | an optional, author-assigned slug (`[a-z0-9-]`)         | `read-tree`, `draft-glow`        |

A `handle` is **author-assigned** (not positional) and **unique within a project**,
so it is both memorable and stable across rearrangement. A node with no handle simply
has none and is named by its `hashCodeId` (or full `actionHash`).

One resolver — `resolveRef(project, ref)` (`web/src/nodeRef.ts`) — accepts any of the
three and returns the node's `actionHash`, or `null` when nothing matches (unresolved
refs are reported, never silently mismatched). `read_tree` exposes each node's
`{ actionHash, hashCodeId, handle? }` under `nodeRefs`, so an agent can name a node by
whichever referent is convenient.

## In-prose links: `[[handle]]` / `[[hashCodeId]]`

In any rendered prose (outcome/spec markdown, completion criteria, chat messages),
refer to a node by wrapping its handle or hashCodeId in double square brackets —
`[[read-tree]]`, `[[200172]]`. Acorn detects these tokens (`web/src/handleLinks.ts`)
and renders them as navigable links to the node; an unresolved token falls back to
plain text, never a broken link. Always use this notation when mentioning a node in
prose — a bare handle or number is inert. Only stable referents go inside the
brackets; the path form below does not.

## Casual reference — the relative path (ephemeral)

For in-the-moment conversation a node can be named by a **relative path** from a known
ancestor plus left-to-right child positions:

```
<ancestor-ref>/<index>[/<index>...]
```

where `ancestor-ref` is any stable referent (handle / hashCodeId / actionHash) and
each `index` is a 0-based **left-to-right** sibling position. Left-to-right follows the
clarity-tree convention: index `0` is the leftmost (most foundational) child — the one
with the highest `siblingOrder`.

Examples:

- `llm-via-api/3` — the 4th child (index 3, left-to-right) under the node whose handle
  is `llm-via-api`.
- `200172/0` — the leftmost child of the node whose hashCodeId is `200172`.
- `read-tree/1/0` — the leftmost child of the 2nd child of `read-tree`.

`resolveRef` accepts the path form best-effort against the **live** tree at call time.

> **The path form is EPHEMERAL.** It reads naturally while talking, but it points at a
> *position*, and positions move when the tree is rearranged — so a path that resolves
> today may resolve to a different node (or to nothing) tomorrow. A relative path is
> therefore **never stored as a node's identity**. Persist identity only as a `handle`
> (author-assigned) or the content-addressed `actionHash` / `hashCodeId`.
