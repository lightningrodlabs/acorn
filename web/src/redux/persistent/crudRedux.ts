import _ from 'lodash'

export function isCrud(
  action,
  createAction,
  fetchAction,
  updateAction,
  deleteAction
) {
  return [createAction, fetchAction, updateAction, deleteAction].includes(
    action.type
  )
}

export function crudReducer(
  state,
  action,
  createAction,
  fetchAction,
  updateAction,
  deleteAction
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
      return {
        ...state,
        [cellIdString]: {
          ...state[cellIdString],
          [payload.headerHash]: {
            ...payload.entry,
            headerHash: payload.headerHash,
          },
        },
      }

    // FETCH
    case fetchAction:
      // payload is [ { entry: { key: val }, headerHash: 'QmAsdFg' }, ... ]
      const mapped = payload.map((r) => {
        return {
          ...r.entry,
          headerHash: r.headerHash,
        }
      })
      // mapped is [ { key: val, headerHash: 'QmAsdFg' }, ...]
      const newVals = _.keyBy(mapped, 'headerHash')
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
      return {
        ...state,
        [cellIdString]: _.pickBy(
          state[cellIdString],
          (value, key) => key !== payload
        ),
      }
    default:
      return state
  }
}

type ActionCreator = (cellIdString: string, payload: any) => Action
type Action = {
  type: string
  payload: any
  meta: {
    cellIdString: string
  }
}

export function createCrudActionCreators(
  model: string
): [string[], ActionCreator[]] {
  const CREATE_ACTION = `CREATE_${model}`
  const FETCH_ACTION = `FETCH_${model}S`
  const UPDATE_ACTION = `UPDATE_${model}`
  const DELETE_ACTION = `DELETE_${model}`

  const createAction = (cellIdString, payload) => {
    return {
      type: CREATE_ACTION,
      payload: payload,
      meta: { cellIdString },
    }
  }
  const fetchAction = (cellIdString, payload) => {
    return {
      type: FETCH_ACTION,
      payload: payload,
      meta: { cellIdString },
    }
  }
  const updateAction = (cellIdString, payload) => {
    return {
      type: UPDATE_ACTION,
      payload: payload,
      meta: { cellIdString },
    }
  }
  const deleteAction = (cellIdString, payload) => {
    return {
      type: DELETE_ACTION,
      payload: payload,
      meta: { cellIdString },
    }
  }
  return [
    [CREATE_ACTION, FETCH_ACTION, UPDATE_ACTION, DELETE_ACTION],
    [createAction, fetchAction, updateAction, deleteAction],
  ]
}
