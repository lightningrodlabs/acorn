import { AllProjectsDataExport, ProjectExportDataV1 } from 'zod-models'
import testComments from '../src/stories/testData/testComments'
import testEntryPoint from '../src/stories/testData/testEntryPoint'
import testOutcomeMember from '../src/stories/testData/testOutcomeMember'
import testProfile from '../src/stories/testData/testProfile'
import testTags from '../src/stories/testData/testTags'
import { LayeringAlgorithm } from '../src/types'

const sampleGoodUnmigratedProjectData: ProjectExportDataV1 = {
  projectMeta: {
    creatorAgentPubKey: 'uhCAkXUcVBUI6zCh1nAPrFx-PpdM5mY7Lc3H7dWNskcQY3SLZF06t',
    createdAt: 1689176310504,
    name: 'new project',
    image: '',
    passphrase: 'daily plant employee shorten define',
    isImported: false,
    layeringAlgorithm: LayeringAlgorithm.CoffmanGraham,
    topPriorityOutcomes: ['oldActionHash'],
    isMigrated: null,
    actionHash: 'uhCkkBzwPwj4l3XGeXJTt9mxL88LOKOm_fvh0kw6PSf5jnP_RUG14',
  },
  outcomes: {
    'uhCkkOWAmlIrMCcxwfvGWsFry55sdG-_EU7o0SZ6I9W0ZoJ-UKnS2': {
      content: 'a first outcome',
      creatorAgentPubKey:
        'uhCAkXUcVBUI6zCh1nAPrFx-PpdM5mY7Lc3H7dWNskcQY3SLZF06t',
      editorAgentPubKey: null,
      timestampCreated: 1689176320,
      timestampUpdated: null,
      scope: {
        Uncertain: {
          smallsEstimate: 0,
          timeFrame: null,
          inBreakdown: false,
        },
      },
      tags: ['124'],
      description: '',
      isImported: false,
      githubLink: '',
      actionHash: 'uhCkkOWAmlIrMCcxwfvGWsFry55sdG-_EU7o0SZ6I9W0ZoJ-UKnS2',
    },
    'uhCkk8QU4T_U2ANFLV3fhKinC-JKrl80qfeThGR2SUjCHIl6ihQjS': {
      content: 'a second one',
      creatorAgentPubKey:
        'uhCAkXUcVBUI6zCh1nAPrFx-PpdM5mY7Lc3H7dWNskcQY3SLZF06t',
      editorAgentPubKey: null,
      timestampCreated: 1689176325,
      timestampUpdated: null,
      scope: {
        Uncertain: {
          smallsEstimate: 0,
          timeFrame: null,
          inBreakdown: false,
        },
      },
      tags: [],
      description: '',
      isImported: false,
      githubLink: '',
      actionHash: 'uhCkk8QU4T_U2ANFLV3fhKinC-JKrl80qfeThGR2SUjCHIl6ihQjS',
    },
    'uhCkkaL_X1Fjk8sSHElhijhl_vzcglx0DqlE0tGxzeNkP5-IiQl0p': {
      content: 'a third',
      creatorAgentPubKey:
        'uhCAkXUcVBUI6zCh1nAPrFx-PpdM5mY7Lc3H7dWNskcQY3SLZF06t',
      editorAgentPubKey: null,
      timestampCreated: 1689176329,
      timestampUpdated: null,
      scope: {
        Uncertain: {
          smallsEstimate: 0,
          timeFrame: null,
          inBreakdown: false,
        },
      },
      tags: [],
      description: '',
      isImported: false,
      githubLink: '',
      actionHash: 'uhCkkaL_X1Fjk8sSHElhijhl_vzcglx0DqlE0tGxzeNkP5-IiQl0p',
    },
    'uhCkkA9Ui-ZHqkg7Yi2lFFeDW0Q7WOOPC6uzzTtWAeqnTz315o-w6': {
      content: 'a new one here',
      creatorAgentPubKey:
        'uhCAkLe1mu-Yb1x9C1zR8uhrjqEH9FdxEmi9BN5ebNceiaog1ugd-',
      editorAgentPubKey: null,
      timestampCreated: 1689176486,
      timestampUpdated: null,
      scope: {
        Uncertain: {
          smallsEstimate: 0,
          timeFrame: null,
          inBreakdown: false,
        },
      },
      tags: [],
      description: '',
      isImported: false,
      githubLink: '',
      actionHash: 'uhCkkA9Ui-ZHqkg7Yi2lFFeDW0Q7WOOPC6uzzTtWAeqnTz315o-w6',
    },
    uhCkkkyAESJ5aouAXB9oHDmI3CZvN5nyDLcmbKTIZlAO9CGFy4eNK: {
      content: 'foo',
      creatorAgentPubKey:
        'uhCAkLe1mu-Yb1x9C1zR8uhrjqEH9FdxEmi9BN5ebNceiaog1ugd-',
      editorAgentPubKey: null,
      timestampCreated: 1689176556,
      timestampUpdated: null,
      scope: {
        Uncertain: {
          smallsEstimate: 0,
          timeFrame: null,
          inBreakdown: false,
        },
      },
      tags: [],
      description: '',
      isImported: false,
      githubLink: '',
      actionHash: 'uhCkkkyAESJ5aouAXB9oHDmI3CZvN5nyDLcmbKTIZlAO9CGFy4eNK',
    },
    'uhCkkqZwts-nOmbF3qh7CZbV3N5a837hI6iABYKDLhDzJHuF83y4B': {
      content: 'blah',
      creatorAgentPubKey:
        'uhCAkXUcVBUI6zCh1nAPrFx-PpdM5mY7Lc3H7dWNskcQY3SLZF06t',
      editorAgentPubKey: null,
      timestampCreated: 1689176606,
      timestampUpdated: null,
      scope: {
        Uncertain: {
          smallsEstimate: 0,
          timeFrame: null,
          inBreakdown: false,
        },
      },
      tags: [],
      description: '',
      isImported: false,
      githubLink: '',
      actionHash: 'uhCkkqZwts-nOmbF3qh7CZbV3N5a837hI6iABYKDLhDzJHuF83y4B',
    },
  },
  connections: {
    'uhCkklwoHZso5wivG-meTymzw7gt0aj6plv-p7Ddu7RrlJ9ogt4om': {
      parentActionHash: 'uhCkkOWAmlIrMCcxwfvGWsFry55sdG-_EU7o0SZ6I9W0ZoJ-UKnS2',
      childActionHash: 'uhCkk8QU4T_U2ANFLV3fhKinC-JKrl80qfeThGR2SUjCHIl6ihQjS',
      randomizer: 1689176325335,
      isImported: false,
      actionHash: 'uhCkklwoHZso5wivG-meTymzw7gt0aj6plv-p7Ddu7RrlJ9ogt4om',
    },
    'uhCkkH6pM9EPPn6P65AcA2hAVbgSoc1LRN-5J9dtkgeVAZW-05jb4': {
      parentActionHash: 'uhCkkOWAmlIrMCcxwfvGWsFry55sdG-_EU7o0SZ6I9W0ZoJ-UKnS2',
      childActionHash: 'uhCkkaL_X1Fjk8sSHElhijhl_vzcglx0DqlE0tGxzeNkP5-IiQl0p',
      randomizer: 1689176329302,
      isImported: false,
      actionHash: 'uhCkkH6pM9EPPn6P65AcA2hAVbgSoc1LRN-5J9dtkgeVAZW-05jb4',
    },
    uhCkkyBZLpeLHHO0Rm_f3F1c1IRiq746hW_k4g6TttWw7b5v0Np14: {
      parentActionHash: 'uhCkkA9Ui-ZHqkg7Yi2lFFeDW0Q7WOOPC6uzzTtWAeqnTz315o-w6',
      childActionHash: 'uhCkkOWAmlIrMCcxwfvGWsFry55sdG-_EU7o0SZ6I9W0ZoJ-UKnS2',
      randomizer: 1689176486919,
      isImported: false,
      actionHash: 'uhCkkyBZLpeLHHO0Rm_f3F1c1IRiq746hW_k4g6TttWw7b5v0Np14',
    },
    uhCkkqYr6rPBeYgZf19XW1BLpjiZFVd4CNALem9xVZoOjCNAvhmlZ: {
      parentActionHash: 'uhCkkkyAESJ5aouAXB9oHDmI3CZvN5nyDLcmbKTIZlAO9CGFy4eNK',
      childActionHash: 'uhCkk8QU4T_U2ANFLV3fhKinC-JKrl80qfeThGR2SUjCHIl6ihQjS',
      randomizer: 1689176556919,
      isImported: false,
      actionHash: 'uhCkkqYr6rPBeYgZf19XW1BLpjiZFVd4CNALem9xVZoOjCNAvhmlZ',
    },
    uhCkkWwn0Eug52wTO7dDrWyhnQgaKxiV1ki8NhpxrXzM8aP4813AF: {
      parentActionHash: 'uhCkkOWAmlIrMCcxwfvGWsFry55sdG-_EU7o0SZ6I9W0ZoJ-UKnS2',
      childActionHash: 'uhCkkqZwts-nOmbF3qh7CZbV3N5a837hI6iABYKDLhDzJHuF83y4B',
      randomizer: 1689176606718,
      isImported: false,
      actionHash: 'uhCkkWwn0Eug52wTO7dDrWyhnQgaKxiV1ki8NhpxrXzM8aP4813AF',
    },
  },
  outcomeMembers: {
    testOutcomeMemberActionHash: {
      ...testOutcomeMember,
      outcomeActionHash:
        'uhCkkaL_X1Fjk8sSHElhijhl_vzcglx0DqlE0tGxzeNkP5-IiQl0p',
    },
  },
  outcomeComments: {
    testOutcomeCommentActionHash: {
      ...testComments[0],
      outcomeActionHash:
        'uhCkk8QU4T_U2ANFLV3fhKinC-JKrl80qfeThGR2SUjCHIl6ihQjS',
    },
  },
  entryPoints: {
    testEntryPointActionHash: {
      ...testEntryPoint,
      outcomeActionHash:
        'uhCkkOWAmlIrMCcxwfvGWsFry55sdG-_EU7o0SZ6I9W0ZoJ-UKnS2',
    },
  },
  tags: {
    testTagActionHash: testTags[0],
  },
}

const sampleGoodMigratedProjectData: ProjectExportDataV1 = {
  ...sampleGoodUnmigratedProjectData,
  projectMeta: {
    ...sampleGoodUnmigratedProjectData.projectMeta,
    isMigrated: 'v1.0.0-alpha',
    passphrase: 'daily plant employee shorten other',
  },
}

const sampleGoodDataExport: AllProjectsDataExport = {
  myProfile: testProfile,
  projects: [sampleGoodUnmigratedProjectData, sampleGoodMigratedProjectData],
  integrityVersion: '8',
}

export { sampleGoodDataExport }
