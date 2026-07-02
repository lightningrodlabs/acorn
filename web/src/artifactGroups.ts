/**
 * Artifact grouping — the distinction between a node's CLARITY-INPUT artifacts
 * (designs, docs, references, retained conversations) and its AGENT-OUTPUT /
 * work-product artifacts (files, PRs, build logs an agent produced).
 *
 * The distinction is derived from the artifact `type` (there is no separate role
 * field on OutcomeArtifact): a small set of type strings denote outputs; every
 * other type — including conversation / conversation-ref, which are retained
 * clarity inputs — reads as an input. Pure, so it drives both the editor's grouped
 * rendering and any tests.
 */
import { OutcomeArtifact } from './outcomeFields'

export type ArtifactGroup = 'input' | 'output'

/**
 * Artifact `type` values that denote an agent-produced work-product OUTPUT.
 * Everything else is treated as a clarity INPUT. Open by design — add types here
 * as the vocabulary grows.
 */
export const OUTPUT_ARTIFACT_TYPES = new Set<string>(['workproduct', 'output'])

/** Which group an artifact belongs to, by its (case-insensitive) type. */
export function artifactGroup(artifact: OutcomeArtifact): ArtifactGroup {
  const type = (artifact?.type || '').trim().toLowerCase()
  return OUTPUT_ARTIFACT_TYPES.has(type) ? 'output' : 'input'
}

/** An artifact paired with its ORIGINAL index in the unpartitioned list. */
export interface IndexedArtifact {
  artifact: OutcomeArtifact
  index: number
}

/**
 * Partition artifacts into input and output groups while PRESERVING each
 * artifact's original index, so the editor's edit/remove callbacks keep operating
 * on the real position in the stored list. Relative order within a group is kept.
 */
export function groupArtifacts(items: OutcomeArtifact[]): {
  input: IndexedArtifact[]
  output: IndexedArtifact[]
} {
  const input: IndexedArtifact[] = []
  const output: IndexedArtifact[] = []
  ;(items ?? []).forEach((artifact, index) => {
    const bucket = artifactGroup(artifact) === 'output' ? output : input
    bucket.push({ artifact, index })
  })
  return { input, output }
}
