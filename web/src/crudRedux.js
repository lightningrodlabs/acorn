import _ from 'lodash'
import { createZomeCallAsyncAction } from 'connoropolous-hc-redux-middleware'

export function isCrud(action, create, fetch, update, archive) {
  return [create, fetch, update, archive]
    .map(a => a.success().type)
    .includes(action.type)
}

export function crudReducer(state, action, create, fetch, update, archive) {
  const {
    payload,
    type,
    meta: { cellIdString },
  } = action

  switch (type) {
    // CREATE AND UPDATE SHARE A RESPONSE TYPE
    case create.success().type:
    case update.success().type:
      return {
        ...state,
        [cellIdString]: {
          ...state[cellIdString],
          [payload.address]: {
            ...payload.entry,
            address: payload.address,
          },
        },
      }

    // FETCH
    case fetch.success().type:
      // payload is [ { entry: { key: val }, address: 'QmAsdFg' }, ... ]
      const mapped = payload.map(r => {
        return {
          ...r.entry,
          address: r.address,
        }
      })
      // mapped is [ { key: val, address: 'QmAsdFg' }, ...]
      const newVals = _.keyBy(mapped, 'address')
      // combines pre-existing values of the object with new values from
      // Holochain fetch
      return {
        ...state,
        [cellIdString]: {
          ...state[cellIdString],
          ...newVals,
        },
      }

    // ARCHIVE EDGE
    case archive.success().type:
      return {
        ...state,
        [cellIdString]: _.pickBy(state[cellIdString], (value, key) => key !== payload),
      }
    default:
      return state
  }
}

export function createCrudActionCreators(zome_name, model) {
  const create = createZomeCallAsyncAction(zome_name, `create_${model}`)
  const update = createZomeCallAsyncAction(zome_name, `update_${model}`)
  const fetch = createZomeCallAsyncAction(zome_name, `fetch_${model}s`)
  const archive = createZomeCallAsyncAction(zome_name, `archive_${model}`)
  return [create, fetch, update, archive]
}
