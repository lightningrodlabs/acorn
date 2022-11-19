/*
  There should be an actions.ts file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { ActionHashB64, CellIdString } from '../../../types/shared'

/* constants */
const COLLAPSE_OUTCOME = 'COLLAPSE_OUTCOME'
const EXPAND_OUTCOME = 'EXPAND_OUTCOME'
const EXPAND_ALL_OUTCOMES = 'EXPAND_ALL_OUTCOMES'

/* action creator functions */

function collapseOutcome(
  projectCellId: CellIdString,
  outcomeActionHash: ActionHashB64
) {
  return {
    type: COLLAPSE_OUTCOME,
    payload: {
      outcomeActionHash,
      projectCellId,
    },
  }
}

function expandOutcome(
  projectCellId: CellIdString,
  outcomeActionHash: ActionHashB64
) {
  return {
    type: EXPAND_OUTCOME,
    payload: {
      outcomeActionHash,
      projectCellId,
    },
  }
}

function expandAllOutcomes(projectCellId: CellIdString) {
  return {
    type: COLLAPSE_OUTCOME,
    payload: projectCellId,
  }
}

export {
  COLLAPSE_OUTCOME,
  EXPAND_OUTCOME,
  EXPAND_ALL_OUTCOMES,
  collapseOutcome,
  expandOutcome,
  expandAllOutcomes,
}
