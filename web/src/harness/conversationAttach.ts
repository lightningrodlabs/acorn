/**
 * Where to attach a captured conversation — computed, not guessed (the attach
 * leaf). A conversation usually shapes a whole BRANCH, so the default target is
 * the lowest common ancestor of the nodes the session edited. With no edits
 * (pure discussion) it falls back to the conversation's ask-time anchor: the
 * FIRST user turn's selection. If the LCA floats all the way to the root (the
 * session touched unrelated branches), we don't dump the transcript at the top —
 * we ask the human.
 *
 * Pure: takes a minimal tree shape + the edited-node ids + the anchor, returns a
 * target + a reason. The chat panel supplies the inputs and acts on the result.
 */

/** The minimal tree shape this needs: parent/child edges + which nodes exist. */
export interface AttachTree {
  outcomes: Record<string, unknown>
  connections: Record<string, { parentActionHash: string; childActionHash: string }>
}

export type AttachReason = 'lca' | 'anchor' | 'prompt' | 'none'

export interface AttachTarget {
  /** actionHash of the proposed target node, or null when none can be derived. */
  target: string | null
  reason: AttachReason
}

/** child actionHash -> parent actionHash (first parent wins; assembly edge). */
function parentMap(tree: AttachTree): Map<string, string> {
  const m = new Map<string, string>()
  for (const c of Object.values(tree.connections || {})) {
    if (c && c.childActionHash && c.parentActionHash && !m.has(c.childActionHash)) {
      m.set(c.childActionHash, c.parentActionHash)
    }
  }
  return m
}

/** node and its ancestors, closest-first up to the root. Cycle-safe. */
function ancestorsInclusive(id: string, parents: Map<string, string>): string[] {
  const chain: string[] = []
  const seen = new Set<string>()
  let cur: string | undefined = id
  while (cur && !seen.has(cur)) {
    chain.push(cur)
    seen.add(cur)
    cur = parents.get(cur)
  }
  return chain
}

/** A node with no parent (a tree root). */
function isRoot(id: string, parents: Map<string, string>): boolean {
  return !parents.has(id)
}

/**
 * Lowest common ancestor of a set of nodes, or null if the set is empty or a
 * node is unknown. A single node is its own LCA.
 */
export function lowestCommonAncestor(
  tree: AttachTree,
  ids: string[]
): string | null {
  const known = ids.filter((id) => tree.outcomes && id in tree.outcomes)
  if (!known.length) return null
  const parents = parentMap(tree)
  const chains = known.map((id) => ancestorsInclusive(id, parents))
  // Walk the first node's chain closest-first; the first entry that is an
  // ancestor-or-self of every node is the lowest common ancestor.
  for (const cand of chains[0]) {
    if (chains.every((chain) => chain.includes(cand))) return cand
  }
  return null
}

/**
 * Compute the default attach target.
 *  - editedNodeIds present -> the LCA of the edits, with the ask-time anchor
 *    FOLDED IN as a hint: since the conversation was usually opened against the
 *    branch it is about, LCA(edits ∪ anchor) raises the target up to that branch.
 *    Folding a node into an LCA set can only move the result toward the root, so
 *    the anchor either keeps the edits-LCA (anchor already inside its subtree) or
 *    lifts it to a shared ancestor. GUARD: the anchor may raise WITHIN the tree,
 *    but it must never drag a well-scoped edit set all the way up to a bare root
 *    (an unrelated anchor) — in that case we keep the edits-only LCA.
 *    If the final LCA is itself a root reached by spanning unrelated branches,
 *    reason 'prompt' (ask rather than attach at the top).
 *  - no edits -> the anchor (first-turn ask-time selection), reason 'anchor'.
 *  - nothing to go on -> reason 'none'.
 */
export function computeAttachTarget(args: {
  tree: AttachTree
  editedNodeIds: string[]
  anchor: string | null
}): AttachTarget {
  const { tree, editedNodeIds, anchor } = args
  const edited = (editedNodeIds || []).filter(
    (id) => tree.outcomes && id in tree.outcomes
  )
  const anchorKnown =
    anchor && tree.outcomes && anchor in tree.outcomes ? anchor : null
  const parents = parentMap(tree)

  if (edited.length) {
    const editsLca = lowestCommonAncestor(tree, edited)
    if (!editsLca) return { target: null, reason: 'prompt' }

    // Fold the anchor into the LCA set — but only if it doesn't drag a set that
    // was scoped below the root all the way up to the root (unrelated anchor).
    let lca = editsLca
    if (anchorKnown && !edited.includes(anchorKnown)) {
      const combined = lowestCommonAncestor(tree, [...edited, anchorKnown])
      if (combined && !(isRoot(combined, parents) && !isRoot(editsLca, parents))) {
        lca = combined
      }
    }

    // Root LCA only counts as degenerate when the set actually spanned more than
    // one node; a session that edited only the root legitimately targets it.
    const scope = anchorKnown ? [...new Set([...edited, anchorKnown])] : edited
    if (isRoot(lca, parents) && scope.length > 1 && !scope.every((e) => e === lca)) {
      return { target: lca, reason: 'prompt' }
    }
    return { target: lca, reason: 'lca' }
  }
  if (anchorKnown) {
    return { target: anchorKnown, reason: 'anchor' }
  }
  return { target: null, reason: 'none' }
}
