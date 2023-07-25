import { LayeringAlgorithm } from '../../types'

const testProject = {
  projectMeta: {
    testProjectCellId: {
      creatorAgentPubKey: 'testCreatorAgentPubKey',
      createdAt: 1234,
      name: 'testProjectName',
      image: null,
      passphrase: 'testPassphrase',
      isImported: false,
      layeringAlgorithm: LayeringAlgorithm.CoffmanGraham,
      topPriorityOutcomes: [],
      isMigrated: null,
    },
  },
  actionHash: 'testProjectActionHash',
}

export default testProject
