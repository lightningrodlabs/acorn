import { ProjectExportData } from 'zod-models'
import { LayeringAlgorithm } from '../src/types'

const mockProjectData: ProjectExportData = {
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
