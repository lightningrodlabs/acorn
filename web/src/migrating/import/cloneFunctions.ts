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
import { LayoutAlgorithm, ProjectMetaWithActionHash } from 'zod-models'

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
  // make sure tag references hold up through the migration
  const originalTags = old['tags']
  const newTags: ActionHashB64[] = []
  const unfoundReferences: ActionHashB64[] = []
  for (let originalTagActionHash of originalTags) {
    const newTagActionHash = tagActionHashMap[originalTagActionHash]
    if (!newTagActionHash) {
      unfoundReferences.push(originalTagActionHash)
    } else {
      newTags.push(newTagActionHash)
    }
  }

  if (originalTags && unfoundReferences.length > 0) {
    throw new Error(`Broken references within 'outcomes' for 'tags'. Unable to locate the Tags referred to by the hashes: ${unfoundReferences}.
Please inspect your data file, look for these references, and edit it to fix the
issue. Then try again.`)
  }

  return {
    ...old,
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

  if (!newParentOutcomeActionHash) {
    throw new Error(
      `Broken reference within 'connections' for 'parentActionHash'. Unable to locate the Outcome referred to by the hash: ${old.parentActionHash}.
      Please inspect your data file, look for these references, and edit it to fix the
      issue. Then try again.`
    )
  }
  if (!newChildOutcomeActionHash) {
    throw new Error(
      `Broken reference within 'connections' for 'childActionHash'. Unable to locate the Outcome referred to by the hash: ${old.childActionHash}.
      Please inspect your data file, look for these references, and edit it to fix the
      issue. Then try again.`
    )
  }

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
  const topPriorityOutcomes: ActionHashB64[] = []
  const unfoundReferences: ActionHashB64[] = []
  for (let i in originalTopPriorityOutcomes) {
    const originalOutcomeActionHash = originalTopPriorityOutcomes[i]
    const newOutcomeActionHash = outcomeActionHashMap[originalOutcomeActionHash]
    if (!newOutcomeActionHash) {
      unfoundReferences.push(originalOutcomeActionHash)
    } else {
      topPriorityOutcomes.push(newOutcomeActionHash)
    }
  }

  if (originalTopPriorityOutcomes && unfoundReferences.length > 0) {
    throw new Error(
      `Broken references within projectMeta. Unable to locate the Outcomes referred to by the hashes: ${unfoundReferences}.
      Please inspect your data file, look for these references, and edit it to fix the
      issue. Then try again.`
    )
  }

  return {
    ...old,
    topPriorityOutcomes,
    // add a fallback layout algorithm in case the project has none
    layoutAlgorithm: old['layoutAlgorithm']
      ? old['layoutAlgorithm']
      : LayoutAlgorithm.LongestPath,
    createdAt: Date.now(),
    creatorAgentPubKey: agentAddress,
    passphrase,
    isMigrated: null,
  }
}

export const cloneData = <T extends { outcomeActionHash: ActionHashB64 }>(
  outcomeActionHashMap: ActionHashMap
) => (old: WithActionHash<T>): WithActionHash<T> => {
  const newOutcomeActionHash = outcomeActionHashMap[old.outcomeActionHash]

  if (!newOutcomeActionHash) {
    throw new Error(
      `Broken reference in the data set. Unable to locate the Outcome referred to by the hash: ${old.outcomeActionHash}.
Please inspect your data file, look for these references, and edit it to fix the
issue. Then try again.`
    )
  }

  return {
    ...old,
    outcomeActionHash: newOutcomeActionHash,
    isImported: true,
  }
}
