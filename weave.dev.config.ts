import { defineConfig } from '@theweave/cli'

export default defineConfig({
  toolCurations: [
    {
      url: 'https://raw.githubusercontent.com/lightningrodlabs/weave-tool-curation/refs/heads/test-0.13/0.13/lists/curations-0.13.json',
      useLists: ['default'],
    },
  ],
  groups: [
    {
      name: 'Lightning Rod Labs',
      networkSeed: '098rc1m-09384u-crm-29384u-cmkj',
      icon: {
        type: 'filesystem',
        path: './icons/lrl-icon.png',
      },
      creatingAgent: {
        agentIdx: 1,
        agentProfile: {
          nickname: 'Zippy',
          avatar: {
            type: 'filesystem',
            path: './icons/zippy.jpg',
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
              path: './icons/zerbina.jpg',
            },
          },
        },
      ],
      applets: [
        {
          name: 'Acorn Hot Reload',
          instanceName: 'Acorn Hot Reload',
          registeringAgent: 1,
          joiningAgents: [2],
        },
        {
          name: 'kando',
          instanceName: 'kando',
          registeringAgent: 1,
          joiningAgents: [2],
        },
      ],
    },
  ],
  applets: [
    {
      name: 'Acorn Hot Reload',
      subtitle: 'Acorn',
      description: 'State of affairs trees!',
      icon: {
        type: 'filesystem',
        path: './icons/acorn-app-icon-512px.png',
      },
      source: {
        type: 'localhost',
        happPath: './happs/happ/workdir/acorn.happ',
        uiPort: 8081,
      },
    },
    {
      name: 'kando',
      subtitle: 'kanban boards',
      description: 'Real-time kanban based on syn',
      icon: {
        type: 'https',
        url: 'https://raw.githubusercontent.com/holochain-apps/kando/main/we_dev/kando_icon.png',
      },
      source: {
        type: 'https',
        url: 'https://github.com/holochain-apps/kando/releases/download/v0.13.0-rc.0/kando.webhapp',
      },
    },
  ],
})
