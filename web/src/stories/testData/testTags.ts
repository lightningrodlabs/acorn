import { Tag } from '../../types'
import { WithHeaderHash } from '../../types/shared'

export const testTag1HeaderHash = '124'
export const testTag2HeaderHash = '125'
export const testTag3HeaderHash = '126'
export const testTag4HeaderHash = '127'
export const testTag5HeaderHash = '128'

const testTags: WithHeaderHash<Tag>[] = [
  {
    headerHash: testTag1HeaderHash,
    backgroundColor: '#432B3D',
    text: 'TagLabel',
  },
  {
    headerHash: testTag2HeaderHash,
    backgroundColor: '#00A094',
    text: 'Release 0.6.2',
  },
  {
    headerHash: testTag3HeaderHash,
    backgroundColor: '#711CC6',
    text: 'Done',
  },
  {
    headerHash: testTag4HeaderHash,
    backgroundColor: '#1C57C6',
    text: 'Code Refactor',
  },
  {
    headerHash: testTag5HeaderHash,
    backgroundColor: '#EACCCC',
    text: 'Some very long tag',
  },
]

export default testTags
