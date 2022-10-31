import _ from 'lodash'
import { WireRecord } from '../../api/hdkCrud'
import {
  Action,
  HcActionCreator,
  HdkCrudAction,
  ActionHashB64,
  CellIdString,
  WithActionHash,
} from '../../types/shared'

export function isCrud(
  action: Action<any>,
  createAction: string,
  fetchAction: string,
  updateAction: string,
  deleteAction: string
) {
  return [createAction, fetchAction, updateAction, deleteAction].includes(
    action.type
  )
}

export function crudReducer<EntryType>(
  state: {
    [cellId: CellIdString]: {
      [actionHash: ActionHashB64]: WithActionHash<EntryType>
    }
  },
  action: HdkCrudAction<EntryType>,
  createAction: string,
  fetchAction: string,
  updateAction: string,
  deleteAction: string
) {
  const {
    payload,
    type,
    meta: { cellIdString },
  } = action

  switch (type) {
    // CREATE AND UPDATE SHARE A RESPONSE TYPE
    case createAction:
    case updateAction:
      let createOrUpdatePayload = payload as WireRecord<EntryType>
      return {
        ...state,
        [cellIdString]: {
          ...state[cellIdString],
          [createOrUpdatePayload.actionHash]: {
            ...createOrUpdatePayload.entry,
            actionHash: createOrUpdatePayload.actionHash,
          },
        },
      }

    // FETCH
    case fetchAction:
      let fetchPayload = payload as Array<WireRecord<EntryType>>
      const mapped = fetchPayload.map((r) => {
        return {
          ...r.entry,
          actionHash: r.actionHash,
        }
      })
      // mapped is [ { key: val, actionHash: 'QmAsdFg' }, ...]
      const newVals = _.keyBy(mapped, 'actionHash')
      // combines pre-existing values of the object with new values from
      // Holochain fetch
      return {
        ...state,
        [cellIdString]: {
          ...state[cellIdString],
          ...newVals,
        },
      }

    // DELETE
    case deleteAction:
      let deletePayload = payload as ActionHashB64
      return {
        ...state,
        [cellIdString]: _.pickBy(
          state[cellIdString],
          (value, key) => key !== deletePayload
        ),
      }
    default:
      return state
  }
}

export function createCrudActionCreators<EntryType>(
  model: string
): [
  string[],
  [
    // create
    HcActionCreator<WireRecord<EntryType>>,
    // fetch
    HcActionCreator<WireRecord<EntryType>[]>,
    // udpate
    HcActionCreator<WireRecord<EntryType>>,
    // delete
    HcActionCreator<ActionHashB64>
  ]
] {
  const CREATE_ACTION = `CREATE_${model}`
  const FETCH_ACTION = `FETCH_${model}S`
  const UPDATE_ACTION = `UPDATE_${model}`
  const DELETE_ACTION = `DELETE_${model}`

  const createAction: HcActionCreator<WireRecord<EntryType>> = (
    cellIdString,
    payload,
    skipLayoutAnimation
  ) => {
    return {
      type: CREATE_ACTION,
      payload,
      meta: { cellIdString, skipLayoutAnimation },
    }
  }
  const fetchAction: HcActionCreator<Array<WireRecord<EntryType>>> = (
    cellIdString,
    payload,
    skipLayoutAnimation
  ) => {
    return {
      type: FETCH_ACTION,
      payload,
      meta: { cellIdString, skipLayoutAnimation },
    }
  }
  const updateAction: HcActionCreator<WireRecord<EntryType>> = (
    cellIdString,
    payload,
    skipLayoutAnimation
  ) => {
    return {
      type: UPDATE_ACTION,
      payload,
      meta: { cellIdString, skipLayoutAnimation },
    }
  }
  const deleteAction: HcActionCreator<ActionHashB64> = (
    cellIdString,
    payload,
    skipLayoutAnimation
  ) => {
    return {
      type: DELETE_ACTION,
      payload,
      meta: { cellIdString, skipLayoutAnimation },
    }
  }
  return [
    [CREATE_ACTION, FETCH_ACTION, UPDATE_ACTION, DELETE_ACTION],
    [createAction, fetchAction, updateAction, deleteAction],
  ]
}
