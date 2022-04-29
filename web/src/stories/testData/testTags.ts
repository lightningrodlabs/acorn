import { Tag } from '../../types'
import { WithHeaderHash } from '../../types/shared'

export const testTag1HeaderHash = '124'

const testTags: WithHeaderHash<Tag>[] = [
  {
    headerHash: testTag1HeaderHash,
    backgroundColor: '#432B3D',
    text: 'TagLabel',
  },
]

export default testTags
