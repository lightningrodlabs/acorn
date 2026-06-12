/**
 * applyProjectDiff — apply a ProjectDiff onto an EXISTING project's cell via zome
 * calls + Redux dispatch, in the live project's hash space (clarity-tree branch I,
 * i2). New entries are created (their placeholder hashes remapped to the live
 * hashes the DHT assigns), changed entries are updated by their live hash, and
 * removed entries are deleted — so an agent's diff lands in place without
 * recreating the project.
 *
 * Modeled on the import executor and, like it, dependency-injected (zome API +
 * dispatch) so the orchestration logic — ordering and reference remapping — is
 * unit-testable with mocks, independent of a running conductor.
 */
import { CellId } from '@holochain/client'
import ProjectsZomeApi from '../api/projectsApi'
import { getAppWs } from '../hcWebsockets'
import { createProjectsZomeApi } from './import/zomeApiCreators'
import { cellIdFromString } from '../utils'
import { ActionHashB64, CellIdString } from '../types/shared'
import {
  ProjectDiff,
  DiffCollection,
  touchedOutcomeHashes,
} from './projectDiff'

import {
  createOutcome,
  updateOutcome,
  deleteOutcome,
} from '../redux/persistent/projects/outcomes/actions'
import {
  createConnection,
  updateConnection,
  deleteConnection,
} from '../redux/persistent/projects/connections/actions'
import {
  createTag,
  updateTag,
  deleteTag,
} from '../redux/persistent/projects/tags/actions'
import {
  createOutcomeMember,
  updateOutcomeMember,
  deleteOutcomeMember,
} from '../redux/persistent/projects/outcome-members/actions'
import {
  createOutcomeComment,
  updateOutcomeComment,
  deleteOutcomeComment,
} from '../redux/persistent/projects/outcome-comments/actions'
import {
  createEntryPoint,
  updateEntryPoint,
  deleteEntryPoint,
} from '../redux/persistent/projects/entry-points/actions'

type HashMap = { [oldHash: string]: ActionHashB64 }
type ActionCreator = (cellIdString: CellIdString, payload: any) => any
type RemapFn = (entry: any, map: HashMap) => any

// remap an entry's outcome reference (members / comments / entry points)
const remapOutcomeRef: RemapFn = (entry, map) => ({
  ...entry,
  outcomeActionHash: map[entry.outcomeActionHash] ?? entry.outcomeActionHash,
})
// remap a connection's endpoints (either may point at a newly-created outcome)
const remapConnectionRefs: RemapFn = (entry, map) => ({
  ...entry,
  parentActionHash: map[entry.parentActionHash] ?? entry.parentActionHash,
  childActionHash: map[entry.childActionHash] ?? entry.childActionHash,
})

interface CollectionConfig {
  key: DiffCollection
  api: 'outcome' | 'connection' | 'tag' | 'outcomeMember' | 'outcomeComment' | 'entryPoint'
  create: ActionCreator
  update: ActionCreator
  del: ActionCreator
  remap?: RemapFn
}

// Dependency order for CREATES (referenced things first); deletes run in reverse.
const COLLECTIONS: CollectionConfig[] = [
  { key: 'tags', api: 'tag', create: createTag, update: updateTag, del: deleteTag },
  { key: 'outcomes', api: 'outcome', create: createOutcome, update: updateOutcome, del: deleteOutcome },
  { key: 'outcomeMembers', api: 'outcomeMember', create: createOutcomeMember, update: updateOutcomeMember, del: deleteOutcomeMember, remap: remapOutcomeRef },
  { key: 'outcomeComments', api: 'outcomeComment', create: createOutcomeComment, update: updateOutcomeComment, del: deleteOutcomeComment, remap: remapOutcomeRef },
  { key: 'entryPoints', api: 'entryPoint', create: createEntryPoint, update: updateEntryPoint, del: deleteEntryPoint, remap: remapOutcomeRef },
  { key: 'connections', api: 'connection', create: createConnection, update: updateConnection, del: deleteConnection, remap: remapConnectionRefs },
]

export interface ApplyDiffResult {
  // placeholder hash -> live hash, for every newly-created entry
  hashMap: HashMap
  // live outcome hashes the diff touched, for "lighting up" the map (i3)
  touchedOutcomes: ActionHashB64[]
}

export async function internalApplyProjectDiffToCell(
  diff: ProjectDiff,
  cellIdString: CellIdString,
  cellId: CellId,
  dispatch: any,
  projectsZomeApi: ProjectsZomeApi
): Promise<ApplyDiffResult> {
  const hashMap: HashMap = {}

  // 1) CREATE added, dependencies first; record placeholder -> live for remapping.
  for (const c of COLLECTIONS) {
    const added = diff[c.key].added
    for (const oldHash of Object.keys(added)) {
      const entry = { ...added[oldHash] }
      delete entry.actionHash
      const payload = c.remap ? c.remap(entry, hashMap) : entry
      const wire = await (projectsZomeApi as any)[c.api].create(cellId, payload)
      dispatch(c.create(cellIdString, wire))
      hashMap[oldHash] = wire.actionHash
    }
  }

  // 2) UPDATE changed entries by their existing live hash (order-independent).
  for (const c of COLLECTIONS) {
    const updated = diff[c.key].updated
    for (const hash of Object.keys(updated)) {
      const entry = { ...updated[hash] }
      delete entry.actionHash
      const payload = c.remap ? c.remap(entry, hashMap) : entry
      const wire = await (projectsZomeApi as any)[c.api].update(cellId, {
        entry: payload,
        actionHash: hash,
      })
      dispatch(c.update(cellIdString, wire))
    }
  }

  // 3) DELETE removed in reverse dependency order (connections before outcomes…).
  for (const c of [...COLLECTIONS].reverse()) {
    for (const hash of diff[c.key].removed) {
      await (projectsZomeApi as any)[c.api].delete(cellId, hash)
      dispatch(c.del(cellIdString, hash))
    }
  }

  // touched outcomes, remapped to their live hashes, for the highlight
  const touchedOutcomes = touchedOutcomeHashes(diff).map((h) => hashMap[h] ?? h)
  return { hashMap, touchedOutcomes }
}

export async function applyProjectDiffToCell(
  diff: ProjectDiff,
  cellIdString: CellIdString,
  dispatch: any
): Promise<ApplyDiffResult> {
  const appWebsocket = await getAppWs()
  const projectsZomeApi = createProjectsZomeApi(appWebsocket)
  const cellId = cellIdFromString(cellIdString)
  return internalApplyProjectDiffToCell(
    diff,
    cellIdString,
    cellId,
    dispatch,
    projectsZomeApi
  )
}
