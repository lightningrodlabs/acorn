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
  // per-change accept/reject decisions, keyed by changeKey (default-accept:
  // a change absent here is accepted; explicit false rejects it)
  decisions: DecisionMap
}

const defaultState: DraftState = {
  diff: null,
  projectId: null,
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
        decisions: {},
      }
    case UPDATE_DRAFT:
      // keep the project + any still-relevant decisions; swap the diff
      return {
        ...state,
        diff: normalizeDiff(payload.diff),
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
