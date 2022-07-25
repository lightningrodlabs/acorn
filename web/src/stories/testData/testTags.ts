import { Tag } from '../../types'
import { WithActionHash } from '../../types/shared'

export const testTag1ActionHash = '124'
export const testTag2ActionHash = '125'
export const testTag3ActionHash = '126'
export const testTag4ActionHash = '127'
export const testTag5ActionHash = '128'

const testTags: WithActionHash<Tag>[] = [
  {
    actionHash: testTag1ActionHash,
    backgroundColor: '#432B3D',
    text: 'TagLabel',
  },
  {
    actionHash: testTag2ActionHash,
    backgroundColor: '#00A094',
    text: 'Release 0.6.2',
  },
  {
    actionHash: testTag3ActionHash,
    backgroundColor: '#711CC6',
    text: 'Done',
  },
  {
    actionHash: testTag4ActionHash,
    backgroundColor: '#1C57C6',
    text: 'Code Refactor',
  },
  {
    actionHash: testTag5ActionHash,
    backgroundColor: '#EACCCC',
    text: 'Some very long tag',
  },
]

export default testTags
