/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { WireRecord } from '../../../../api/hdkCrud'
import { EntryPoint, EntryPointDetails } from '../../../../types'
import { Action, CellIdString } from '../../../../types/shared'
import { createCrudActionCreators } from '../../crudRedux'

const FETCH_ENTRY_POINT_DETAILS = 'FETCH_ENTRY_POINT_DETAILS'

const fetchEntryPointDetails = (
  cellIdString: CellIdString,
  payload: EntryPointDetails
): Action<EntryPointDetails> => {
  return {
    type: FETCH_ENTRY_POINT_DETAILS,
    payload,
    meta: { cellIdString },
  }
}

const [
  [
    CREATE_ENTRY_POINT,
    FETCH_ENTRY_POINTS,
    UPDATE_ENTRY_POINT,
    DELETE_ENTRY_POINT,
  ],
  [createEntryPoint, fetchEntryPoints, updateEntryPoint, deleteEntryPoint],
] = createCrudActionCreators<EntryPoint>('ENTRY_POINT') // TODO: annotate this with a type for the EntryType generic

export {
  CREATE_ENTRY_POINT,
  FETCH_ENTRY_POINTS,
  UPDATE_ENTRY_POINT,
  DELETE_ENTRY_POINT,
  FETCH_ENTRY_POINT_DETAILS,
  createEntryPoint,
  fetchEntryPoints,
  updateEntryPoint,
  deleteEntryPoint,
  // non-standard
  fetchEntryPointDetails,
}

export type EntryPointsAction =
  | Action<WireRecord<EntryPoint>>
  | Action<EntryPointDetails>
