import { WireRecord } from "../../../../api/hdkCrud"
import { CreateOutcomeWithConnectionOutput, DeleteOutcomeFullyResponse, Outcome } from "../../../../types"
import { Action, CellIdString } from "../../../../types/shared"
import { createCrudActionCreators } from "../../crudRedux"


const [[
  CREATE_OUTCOME,
  FETCH_OUTCOMES,
  UPDATE_OUTCOME,
  DELETE_OUTCOME
],[
  createOutcome,
  fetchOutcomes,
  updateOutcome,
  deleteOutcome
]] = createCrudActionCreators<Outcome>('OUTCOME')

export {
  CREATE_OUTCOME,
  FETCH_OUTCOMES,
  UPDATE_OUTCOME,
  DELETE_OUTCOME,
  CREATE_OUTCOME_WITH_CONNECTION,
  DELETE_OUTCOME_FULLY,
  createOutcome,
  fetchOutcomes,
  updateOutcome,
  deleteOutcome,
  createOutcomeWithConnection,
  deleteOutcomeFully
}

// fn name create_outcome_with_connection,delete_outcome_fully 
const CREATE_OUTCOME_WITH_CONNECTION = 'CREATE_OUTCOME_WITH_CONNECTION'
const DELETE_OUTCOME_FULLY = 'DELETE_OUTCOME_FULLY'

const createOutcomeWithConnection = (cellIdString: CellIdString, payload: CreateOutcomeWithConnectionOutput): Action<CreateOutcomeWithConnectionOutput> => {
  return {
    type: CREATE_OUTCOME_WITH_CONNECTION,
    payload: payload,
    meta: { cellIdString },
  }
}
const deleteOutcomeFully = (cellIdString: CellIdString, payload: DeleteOutcomeFullyResponse): Action<DeleteOutcomeFullyResponse> => {
  return {
    type: DELETE_OUTCOME_FULLY,
    payload: payload,
    meta: { cellIdString },
  }
}
export type OutcomesAction = Action<WireRecord<Outcome>> | Action<CreateOutcomeWithConnectionOutput>