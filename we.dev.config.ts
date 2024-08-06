import { defineConfig } from '@lightningrodlabs/we-dev-cli'

export default defineConfig({
  groups: [
    {
      name: 'Lightning Rod Labs',
      networkSeed: '098rc1m-09384u-crm-29384u-cmkj',
      icon: {
        type: 'filesystem',
        path: './web/src/images/acorn-alpha-logo.png',
      },
      creatingAgent: {
        agentIdx: 1,
        agentProfile: {
          nickname: 'Zippy',
          avatar: {
            type: 'filesystem',
            path: './web/src/images/acorn-alpha-logo.png',
          },
        },
      },
      joiningAgents: [
        {
          agentIdx: 2,
          agentProfile: {
            nickname: 'Zerbina',
            avatar: {
              type: 'filesystem',
              path: './web/src/images/acorn-alpha-logo.png',
            },
          },
        },
      ],
      applets: [
        {
          name: 'Acorn',
          instanceName: 'Acorn',
          registeringAgent: 1,
          joiningAgents: [2],
        },
      ],
    },
  ],
  applets: [
    {
      name: 'Acorn',
      subtitle: 'Just an Example',
      description:
        'Just an example applet to show the various affordances of We',
      icon: {
        type: 'filesystem',
        path: './web/src/images/acorn-alpha-logo.png',
      },
      source: {
        type: 'localhost',
        happPath: './electron/binaries/projects.happ',
        uiPort: 8081,
      },
    },
  ],
})
