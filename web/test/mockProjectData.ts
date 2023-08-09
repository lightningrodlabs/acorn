import { ProjectExportDataV1 } from 'zod-models'
import { LayeringAlgorithm } from '../src/types'

const mockProjectData: ProjectExportDataV1 = {
  projectMeta: {
    creatorAgentPubKey: 'testAgentPubKey',
    createdAt: 1234,
    name: 'testProjectName',
    image: 'testProjectImage',
    passphrase: 'testPassphrase',
    isImported: false,
    layeringAlgorithm: LayeringAlgorithm.CoffmanGraham,
    topPriorityOutcomes: [],
    isMigrated: null,
    actionHash: 'testProjectActionHash',
  },
  outcomes: {},
  connections: {},
  outcomeMembers: {},
  outcomeComments: {},
  entryPoints: {},
  tags: {},
}

export default mockProjectData
