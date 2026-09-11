import { encodeHashToBase64 } from '@holochain/client'
import { childOutcomeWal, routeForWal } from '../src/weave/mainViewTarget'
import { cellIdFromString } from '../src/utils'

const PROJECT =
  '132,45,36,204,129,221,8,19,206,244,229,30,210,95,157,234,241,47,13,85,105,207,55,138,160,87,204,162,244,122,186,195,125,254,5,185,165,224,66[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1'
const OTHER_PROJECT =
  '132,45,36,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1'
const DNA = cellIdFromString(PROJECT)[0]
const OUTCOME_BYTES = new Uint8Array([132, 41, 36, ...Array(36).fill(7)])
const OUTCOME = encodeHashToBase64(OUTCOME_BYTES)

describe('routeForWal()', () => {
  it('routes a card to its project map, panned to it and opened', () => {
    const wal = { hrl: [DNA, OUTCOME_BYTES] as any, context: 'outcome' }
    expect(routeForWal(wal, [OTHER_PROJECT, PROJECT])).toBe(
      `/project/${PROJECT}/map?go_to_outcome=${OUTCOME}&open_outcome=${OUTCOME}`
    )
  })

  it('routes a project to its map', () => {
    const wal = { hrl: [DNA, OUTCOME_BYTES] as any }
    expect(routeForWal(wal, [PROJECT])).toBe(`/project/${PROJECT}/map`)
  })

  it('gives no route for a project we are not in', () => {
    const wal = { hrl: [DNA, OUTCOME_BYTES] as any, context: 'outcome' }
    expect(routeForWal(wal, [OTHER_PROJECT])).toBeUndefined()
  })
})

describe('childOutcomeWal()', () => {
  it('builds the WAL acorn uses for a card', () => {
    const wal = childOutcomeWal(PROJECT, OUTCOME)
    expect(wal.context).toBe('outcome')
    expect(Array.from(wal.hrl[0])).toEqual(Array.from(DNA))
    expect(Array.from(wal.hrl[1])).toEqual(Array.from(OUTCOME_BYTES))
  })

  it('routes back to the same card', () => {
    expect(routeForWal(childOutcomeWal(PROJECT, OUTCOME), [PROJECT])).toBe(
      `/project/${PROJECT}/map?go_to_outcome=${OUTCOME}&open_outcome=${OUTCOME}`
    )
  })
})
