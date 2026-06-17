/**
 * acornTools — the renderer-side implementation of the ACORN-HOSTED callable
 * tools the agent invokes through the harness (clarity-tree draft pipeline L1 +
 * the sibling read leaf). The hosted MCP server (dev-harness/acornToolsServer.js)
 * advertises these to the agent and bridges each `tools/call` back here, where the
 * redux store and the live tree actually live.
 *
 *   read_tree()         → the current ProjectSnapshot (what the agent reads)
 *   propose_edits(diff) → opens an inert draft from a ProjectDiff. Writes NOTHING
 *                         to the DHT — the draft is committed only by a human
 *                         Confirm (L4). This is the whole point of the layer.
 *
 * Kept out of the chat component so it is unit-testable against a mock store with
 * no React / no transport.
 */
import { Store } from 'redux'
import { RootState } from '../redux/reducer'
import { CellIdString } from '../types/shared'
import { readTree } from './readTree'
import { ProjectDiff, diffStats, normalizeDiff } from '../migrating/projectDiff'
import { HarnessToolCall, HarnessToolResult } from './types'
import {
  enterDraftReview,
  updateDraftReview,
} from '../components/diffReview/draftReview'

// The tool surface the agent sees. The hosted MCP server mirrors these names +
// descriptions in its tools/list; keep the two in sync.
export const ACORN_TOOL_NAMES = ['read_tree', 'propose_edits'] as const

// Loose guard: a diff-shaped object with an `outcomes` collection. Partial diffs
// (collections/fields omitted) are fine — normalizeDiff fills them in.
const isProjectDiff = (d: any): boolean =>
  !!d && typeof d === 'object' && !!d.outcomes && typeof d.outcomes === 'object'

/**
 * Whether an ACP permission request is for one of Acorn's own hosted tools.
 * These are non-destructive — read_tree only reads; propose_edits only opens an
 * inert draft (no DHT write) — so the human shouldn't be prompted to approve
 * each call. Matched by the tool name appearing in the request title (the
 * agent's titles include the tool/server name; "acorn" covers the server label).
 */
export function isAcornToolTitle(title: string | undefined): boolean {
  const t = (title || '').toLowerCase()
  return t.includes('acorn') || ACORN_TOOL_NAMES.some((n) => t.includes(n))
}

/**
 * Run one hosted tool call against the store for `projectId`. Pure dispatch +
 * read; never calls a zome directly (propose_edits only touches the ephemeral
 * draft slice), so "nothing reaches the DHT until Confirm" holds by construction.
 */
export async function handleAcornToolCall(
  store: Store,
  projectId: CellIdString,
  call: HarnessToolCall
): Promise<HarnessToolResult> {
  try {
    switch (call.tool) {
      case 'read_tree': {
        const snapshot = readTree(store.getState() as RootState, projectId)
        return { ok: true, result: snapshot }
      }
      case 'propose_edits': {
        // accept either { diff: {...} } or the diff object directly
        const raw = call.args && call.args.diff ? call.args.diff : call.args
        if (!isProjectDiff(raw))
          return {
            ok: false,
            error:
              'propose_edits expects a ProjectDiff ({ outcomes:{added,updated,removed}, … })',
          }
        // an LLM diff may omit collections/fields it didn't touch — fill them in
        const diff = normalizeDiff(raw)
        const state = store.getState() as RootState
        const alreadyOpen =
          !!state.ui.draft.diff && state.ui.draft.projectId === projectId
        if (alreadyOpen) updateDraftReview(store, diff, projectId)
        else enterDraftReview(store, diff, projectId)
        // report what was proposed; the human reviews + confirms in the panel
        return {
          ok: true,
          result: {
            opened: true,
            note: 'Draft opened for human review — inert until Confirm. No DHT write.',
            summary: diffStats(diff),
          },
        }
      }
      default:
        return { ok: false, error: `unknown tool "${call.tool}"` }
    }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) }
  }
}
