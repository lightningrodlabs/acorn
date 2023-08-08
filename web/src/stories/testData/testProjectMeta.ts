import { LayeringAlgorithm, ProjectMeta } from '../../types'
import { WithActionHash } from '../../types/shared'

const testProject: WithActionHash<ProjectMeta> = {
  creatorAgentPubKey: 'testCreatorAgentPubKey',
  createdAt: 1234,
  name: 'testProjectName',
  image: null,
  passphrase: 'testPassphrase',
  isImported: false,
  layeringAlgorithm: "CoffmanGraham",
  topPriorityOutcomes: [],
  isMigrated: null,
  actionHash: 'testProjectActionHash',
}

export default testProject
