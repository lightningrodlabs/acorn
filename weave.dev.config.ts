import { defineConfig } from '@theweave/cli'

export default defineConfig({
  toolCurations: [
    {
      url: 'https://raw.githubusercontent.com/lightningrodlabs/weave-tool-curation/refs/heads/main/0.16/lists/curations-0.16.json',
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
        // DISABLED for the Holochain 0.7 line: the only published kando webhapp
        // is v0.15.0, a 0.6-line artifact that a 0.7 Moss cannot install, and
        // it is registered BEFORE Acorn, so the dev launch dies before Acorn is
        // reached. Re-enable (here and in the top-level `applets` array below)
        // once a kando release built on Holochain 0.7 exists, and point the URL
        // at that release.
        // {
        //   name: 'kando',
        //   instanceName: 'kando',
        //   registeringAgent: 1,
        //   joiningAgents: [2],
        // },
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
    // DISABLED for the Holochain 0.7 line -- see the note in groups[].applets
    // above. v0.15.0 is a 0.6 webhapp; a 0.7 Moss cannot install it.
    // {
    //   name: 'kando',
    //   subtitle: 'kanban boards',
    //   description: 'Real-time kanban based on syn',
    //   icon: {
    //     type: 'https',
    //     url: 'https://raw.githubusercontent.com/holochain-apps/kando/main/we_dev/kando_icon.png',
    //   },
    //   source: {
    //     type: 'https',
    //     url: 'https://github.com/holochain-apps/kando/releases/download/v0.15.0/kando.webhapp',
    //   },
    // },
  ],
})
