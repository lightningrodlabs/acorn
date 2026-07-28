import {
  OPEN_DRAFT,
  UPDATE_DRAFT,
  SET_CHANGE_DECISION,
  UPDATE_DRAFT_ENTRY,
  CLEAR_DRAFT,
} from './actions'
import { CellIdString } from '../../../types/shared'
import { ProjectDiff, normalizeDiff } from '../../../migrating/projectDiff'
import { DecisionMap } from './changes'

export interface DraftState {
  // the LLM-proposed diff under review, or null when no draft is open
  diff: ProjectDiff | null
  // the project the draft belongs to — the overlay only applies to this project
  projectId: CellIdString | null
  // the harness session that proposed this draft, or null for a draft opened
  // outside a session (the file/apply path). With concurrent sessions this is
  // the INTERLOCK stamp: only the owning session may revise the open draft;
  // another session's propose_edits is rejected instead of silently merged.
  // (Interim until per-session drafts — the draft slice stays one-per-window.)
  sessionId: string | null
  // baseline id (snapshot hash) of the tree state this draft's values were
  // merged against — the live tree at open/update time. Confirm re-rebases
  // against it when the tree has moved again (baseline-rebase). Null for
  // pre-baseline drafts (file/apply path).
  baselineId: string | null
  // per-change accept/reject decisions, keyed by changeKey (default-accept:
  // a change absent here is accepted; explicit false rejects it)
  decisions: DecisionMap
}

const defaultState: DraftState = {
  diff: null,
  projectId: null,
  sessionId: null,
  baselineId: null,
  decisions: {},
}

export default function (state = defaultState, action: any): DraftState {
  const { payload, type } = action

  switch (type) {
    case OPEN_DRAFT:
      // normalize: an LLM-proposed diff may omit collections it didn't touch
      return {
        diff: normalizeDiff(payload.diff),
        projectId: payload.projectId,
        sessionId: payload.sessionId || null,
        baselineId: payload.baselineId || null,
        decisions: {},
      }
    case UPDATE_DRAFT:
      // keep the project + any still-relevant decisions; swap the diff
      return {
        ...state,
        diff: normalizeDiff(payload.diff),
        baselineId: payload.baselineId ?? state.baselineId,
      }
    case SET_CHANGE_DECISION:
      if (!state.diff) return state
      return {
        ...state,
        decisions: { ...state.decisions, [payload.key]: payload.accepted },
      }
    case UPDATE_DRAFT_ENTRY: {
      if (!state.diff) return state
      const { collection, op, hash, entry } = payload
      // removed entries carry no payload to edit
      if (op === 'removed') return state
      const delta = state.diff[collection]
      const map = op === 'added' ? delta.added : delta.updated
      // only edit a change that exists
      if (!(hash in map)) return state
      const nextDelta = {
        ...delta,
        [op]: { ...map, [hash]: entry },
      }
      const nextDiff: ProjectDiff = { ...state.diff, [collection]: nextDelta }
      return { ...state, diff: nextDiff }
    }
    case CLEAR_DRAFT:
      return { ...defaultState }
    default:
      return state
  }
}
