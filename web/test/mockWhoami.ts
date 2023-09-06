import { WireRecord } from '../src/api/hdkCrud'
import { Profile } from '../src/types'

const mockProfile: Profile = {
  firstName: 'testFirstName',
  lastName: 'testLastName',
  handle: 'testHandle',
  status: 'Online',
  avatarUrl: 'testAvatarUrl',
  agentPubKey: 'testAgentPubKey',
  isImported: false,
}

const mockWhoami: WireRecord<Profile> = {
  actionHash: 'testActionHash',
  entryHash: 'testEntryHash',
  createdAt: 1234,
  updatedAt: 1234,
  entry: mockProfile,
}

export default mockWhoami
