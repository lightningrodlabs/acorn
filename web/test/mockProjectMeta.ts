import { LayeringAlgorithm } from '../src/types/projectMeta'

const mockProjectMeta = {
  actionHash: 'testActionHash',
  entryHash: 'testEntryHash',
  entry: {
    creatorAgentPubKey: 'testAgentPubKey',
    createdAt: 1234,
    name: 'testName',
    image: null,
    passphrase: 'testPassphrase',
    isImported: false,
    layeringAlgorithm: LayeringAlgorithm.CoffmanGraham,
    topPriorityOutcomes: [],
    isMigrated: null,
  },
  createdAt: 1234,
  updatedAt: 1234,
}
export default mockProjectMeta
