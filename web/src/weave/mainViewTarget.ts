import { decodeHashFromBase64, encodeHashToBase64 } from '@holochain/client'
import { WAL } from '@theweave/api'
import { CellIdWrapper } from '../domain/cellId'
import { GO_TO_OUTCOME, OPEN_OUTCOME } from '../searchParams'
import { ActionHashB64, CellIdString } from '../types/shared'

/**
 * The WAL Acorn uses for a card: its project's DNA hash and the card's action
 * hash, with context 'outcome' -- the same shape appletServices.search returns.
 */
export function childOutcomeWal(
  projectCellIdString: CellIdString,
  outcomeActionHash: ActionHashB64
): WAL {
  return {
    hrl: [
      CellIdWrapper.fromCellIdString(projectCellIdString).getDnaHash(),
      decodeHashFromBase64(outcomeActionHash),
    ],
    context: 'outcome',
  }
}

/**
 * Where the main view goes when Moss opens it on a WAL: the project's map,
 * and for a card, panned to it with its expanded view open. Undefined when the
 * WAL belongs to a project we are not in.
 */
export function routeForWal(
  wal: WAL,
  projectCellIdStrings: CellIdString[]
): string | undefined {
  const dnaHashB64 = encodeHashToBase64(wal.hrl[0])
  const project = projectCellIdStrings.find(
    (cellIdString) =>
      CellIdWrapper.fromCellIdString(cellIdString).getDnaHashB64() === dnaHashB64
  )
  if (!project) return undefined
  if (wal.context === 'outcome') {
    const outcome = encodeHashToBase64(wal.hrl[1])
    return `/project/${project}/map?${GO_TO_OUTCOME}=${outcome}&${OPEN_OUTCOME}=${outcome}`
  }
  return `/project/${project}/map`
}
