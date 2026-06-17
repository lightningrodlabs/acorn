/*
  The draft slice — an ephemeral, non-committed layer holding an LLM-proposed
  ProjectDiff while a human reviews it (clarity-tree draft pipeline). Opening a
  draft never writes to the DHT; only Confirm (L4) does, via applyProjectDiffToCell.
*/

import { CellIdString } from '../../../types/shared'
import { ProjectDiff, DiffCollection } from '../../../migrating/projectDiff'
import { ChangeOp } from './changes'

/* constants */
const OPEN_DRAFT = 'OPEN_DRAFT'
const UPDATE_DRAFT = 'UPDATE_DRAFT'
const SET_CHANGE_DECISION = 'SET_CHANGE_DECISION'
const UPDATE_DRAFT_ENTRY = 'UPDATE_DRAFT_ENTRY'
const CLEAR_DRAFT = 'CLEAR_DRAFT'

/* action creators */

// open (or replace) the draft for a project, resetting any prior decisions
function openDraft(diff: ProjectDiff, projectId: CellIdString) {
  return {
    type: OPEN_DRAFT,
    payload: { diff, projectId },
  }
}

// replace the proposed diff while keeping the draft open (e.g. the agent revised
// its proposal). Decisions for changes that still exist are kept.
function updateDraft(diff: ProjectDiff) {
  return {
    type: UPDATE_DRAFT,
    payload: { diff },
  }
}

// accept (true) or reject (false) a single change, addressed by its changeKey
function setChangeDecision(key: string, accepted: boolean) {
  return {
    type: SET_CHANGE_DECISION,
    payload: { key, accepted },
  }
}

// inline-edit one proposed entry (an added/updated outcome's fields, say),
// writing back into the draft diff's added/updated map for that collection
function updateDraftEntry(
  collection: DiffCollection,
  op: ChangeOp,
  hash: string,
  entry: any
) {
  return {
    type: UPDATE_DRAFT_ENTRY,
    payload: { collection, op, hash, entry },
  }
}

// discard the draft entirely — leaves no trace, writes nothing
function clearDraft() {
  return {
    type: CLEAR_DRAFT,
  }
}

export {
  OPEN_DRAFT,
  UPDATE_DRAFT,
  SET_CHANGE_DECISION,
  UPDATE_DRAFT_ENTRY,
  CLEAR_DRAFT,
  openDraft,
  updateDraft,
  setChangeDecision,
  updateDraftEntry,
  clearDraft,
}
