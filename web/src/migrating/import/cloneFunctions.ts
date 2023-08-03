import { CellId } from '@holochain/client/lib/types'
import { WireRecord } from '../../api/hdkCrud'
import {
  Action,
  ActionHashB64,
  CellIdString,
  WithActionHash,
} from '../../types/shared'
import { cellIdFromString } from '../../utils'
import { Tag } from '../../types/tag'
import { Outcome } from '../../types/outcome'
import { Connection } from '../../types/connection'

export type ActionHashMap = { [oldActionHash: ActionHashB64]: ActionHashB64 }

/*
  This function is an abstracted function
  that can be used for any set of data (dataSet)
  that should be written again to the DHT,
  and the new actionHashes for the data (mapped)
*/
export async function cloneDataSet<T>(
  dataSet: { [actionHash: string]: WithActionHash<T> },
  cloneFn: (old: WithActionHash<T>) => WithActionHash<T>,
  zomeCallFn: (cellId: CellId, obj: T) => Promise<WireRecord<T>>,
  actionCreatorFn: (
    cellIdString: CellIdString,
    obj: WireRecord<T>
  ) => Action<WireRecord<T>>,
  dispatch: any,
  projectsCellIdString: CellIdString
) {
  const newActionHashMap: ActionHashMap = {}

  for (let address of Object.keys(dataSet)) {
    const old = dataSet[address]
    // NOTE: cloneFn should do a deep copy
    // not just return the reference
    const clone = cloneFn(old)
    delete clone.actionHash

    let newObj: WireRecord<T>
    try {
      newObj = await zomeCallFn(cellIdFromString(projectsCellIdString), clone)
      dispatch(actionCreatorFn(projectsCellIdString, newObj))
    } catch (e) {
      console.log(`create obj error`, e)
      throw e
    }

    let oldActionHash: ActionHashB64
    if (old.actionHash) oldActionHash = old.actionHash
    // TODO: fix how oldActionHash could be undefined, what
    // should we do?
    newActionHashMap[oldActionHash] = newObj.actionHash
  }
  return newActionHashMap
}

export const cloneTag = (old: WithActionHash<Tag>): WithActionHash<Tag> => {
  return {
    ...old,
  }
}

export const cloneOutcome = (tagActionHashMap: ActionHashMap) => (
  old: WithActionHash<Outcome>
): WithActionHash<Outcome> => {
  return {
    ...old,
    // make sure tag references hold up through the migration
    tags: old.tags.map(
      (oldTagHash: ActionHashB64) => tagActionHashMap[oldTagHash]
    ),
    isImported: true,
  }
}

export const cloneConnection = (outcomeActionHashMap: ActionHashMap) => (
  old: WithActionHash<Connection>
): WithActionHash<Connection> => {
  const newParentOutcomeActionHash = outcomeActionHashMap[old.parentActionHash]
  // v1.0.4-alpha: childActionHash
  const newChildOutcomeActionHash = outcomeActionHashMap[old.childActionHash]

  return {
    ...old,
    parentActionHash: newParentOutcomeActionHash,
    childActionHash: newChildOutcomeActionHash,
    // randomizer used to be a float, but is now an int
    randomizer: Number(old.randomizer.toFixed()),
    isImported: true,
  }
}

export const cloneData = <T extends { outcomeActionHash: ActionHashB64 }>(
  outcomeActionHashMap: ActionHashMap
) => (old: WithActionHash<T>): WithActionHash<T> => {
  const newOutcomeActionHash = outcomeActionHashMap[old.outcomeActionHash]

  return {
    ...old,
    outcomeActionHash: newOutcomeActionHash,
    isImported: true,
  }
}