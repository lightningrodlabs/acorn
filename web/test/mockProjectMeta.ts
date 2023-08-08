import { WireRecord } from '../src/api/hdkCrud'
import { LayeringAlgorithm, ProjectMeta } from '../src/types/projectMeta'

const projectMeta: ProjectMeta = {
  creatorAgentPubKey: 'testAgentPubKey',
  createdAt: 1234,
  name: 'testName',
  image: null,
  passphrase: 'testPassphrase',
  isImported: false,
  layeringAlgorithm: "CoffmanGraham",
  topPriorityOutcomes: [],
  isMigrated: null,
}

const mockUnmigratedProjectMeta: WireRecord<ProjectMeta> = {
  actionHash: 'testActionHash',
  entryHash: 'testEntryHash',
  entry: projectMeta,
  createdAt: 1234,
  updatedAt: 1234,
}
export default mockUnmigratedProjectMeta
