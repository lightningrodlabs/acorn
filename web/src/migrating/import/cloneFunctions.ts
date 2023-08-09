import { AgentPubKeyB64, CellId } from '@holochain/client/lib/types'
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
import { ProjectMeta } from '../../types'
import { LayeringAlgorithm, ProjectMetaWithActionHash } from 'zod-models'

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

    const newObj: WireRecord<T> = await zomeCallFn(
      cellIdFromString(projectsCellIdString),
      clone
    )
    dispatch(actionCreatorFn(projectsCellIdString, newObj))

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
  const newChildOutcomeActionHash = outcomeActionHashMap[old.childActionHash]

  return {
    ...old, // technically not needed, but left in case more properties are added in future
    parentActionHash: newParentOutcomeActionHash,
    childActionHash: newChildOutcomeActionHash,
    // randomizer used to be a float, but is now an int
    randomizer: Number(old.randomizer.toFixed()),
    isImported: true,
  }
}

export const cloneProjectMeta = (
  outcomeActionHashMap: ActionHashMap,
  agentAddress: AgentPubKeyB64,
  passphrase: string
) => (old: ProjectMetaWithActionHash): WithActionHash<ProjectMeta> => {
  const originalTopPriorityOutcomes = old['topPriorityOutcomes']
  return {
    ...old,
    // the question mark operator for backwards compatibility
    topPriorityOutcomes: originalTopPriorityOutcomes
      ? originalTopPriorityOutcomes
          .map((oldAddress) => outcomeActionHashMap[oldAddress])
          .filter((address) => address)
      : [],
    // add a fallback layering algorithm in case the project has none
    layeringAlgorithm: old['layeringAlgorithm']
      ? old['layeringAlgorithm']
      : LayeringAlgorithm.LongestPath,
    createdAt: Date.now(),
    creatorAgentPubKey: agentAddress,
    passphrase: passphrase,
    isMigrated: null,
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
