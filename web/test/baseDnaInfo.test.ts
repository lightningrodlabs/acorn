/**
 * Base-DNA visibility (baseDnaInfo.ts): the role → provisioned-cell DNA-hash
 * extraction behind the header version tooltip. Two installs comparing these
 * hashes is the "am I on the wrong base DNA?" diagnostic, so the extraction
 * must pick exactly the PROVISIONED cell per role and skip clones.
 */
import { CellType, encodeHashToBase64 } from '@holochain/client'
import { getBaseDnaHashes, shortDnaHash } from '../src/baseDnaInfo'

const dna = (fill: number) => new Uint8Array(39).fill(fill)
const agent = new Uint8Array(39).fill(7)

const provisioned = (dnaFill: number) => ({
  type: CellType.Provisioned,
  value: { cell_id: [dna(dnaFill), agent] },
})
const cloned = (dnaFill: number) => ({
  type: CellType.Cloned,
  value: { cell_id: [dna(dnaFill), agent], enabled: true },
})

describe('getBaseDnaHashes', () => {
  it('maps each role to its provisioned cell DNA hash, ignoring clones', () => {
    const appInfo = {
      cell_info: {
        profiles: [provisioned(1)],
        projects: [cloned(9), provisioned(2), cloned(8)],
      },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hashes = getBaseDnaHashes(appInfo as any)
    expect(Object.keys(hashes).sort()).toEqual(['profiles', 'projects'])
    expect(hashes.profiles).toBe(encodeHashToBase64(dna(1)))
    expect(hashes.projects).toBe(encodeHashToBase64(dna(2)))
    // clone hashes must NOT leak in — they differ per project and would make
    // two matching installs look mismatched
    expect(hashes.projects).not.toBe(encodeHashToBase64(dna(9)))
  })

  it('omits roles with no provisioned cell and survives empty appInfo', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getBaseDnaHashes({ cell_info: { projects: [cloned(3)] } } as any)).toEqual({})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getBaseDnaHashes({} as any)).toEqual({})
  })
})

describe('shortDnaHash', () => {
  it('keeps enough of the hash to compare by eye', () => {
    const full = encodeHashToBase64(dna(5))
    const short = shortDnaHash(full)
    expect(short).toContain('…')
    expect(full.startsWith(short.slice(0, 10))).toBe(true)
    expect(full.endsWith(short.slice(-4))).toBe(true)
  })
})
