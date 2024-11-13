import { defineConfig } from '@theweave/cli'

export default defineConfig({
  groups: [
    {
      name: 'Lightning Rod Labs',
      networkSeed: '098rc1m-09384u-crm-29384u-cmkj',
      icon: {
        type: 'filesystem',
        path: '../web/dist/logo/acorn-app-icon-512px.png',
      },
      creatingAgent: {
        agentIdx: 1,
        agentProfile: {
          nickname: 'Zippy',
          avatar: {
            type: 'filesystem',
            path: '../web/dist/logo/acorn-app-icon-512px.png',
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
              path: '../web/dist/logo/acorn-app-icon-512px.png',
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
        path: '../web/dist/logo/acorn-app-icon-512px.png',
      },
      source: {
        // type: 'localhost',
        // happPath: '../electron/binaries/projects.happ',
        // uiPort: 8081,
        type: 'filesystem',
        path: './acorn.webhapp',
      },
    },
  ],
})
