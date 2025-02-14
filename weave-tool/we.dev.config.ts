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
        path: './weave-tool/lrl-icon.png',
      },
      creatingAgent: {
        agentIdx: 1,
        agentProfile: {
          nickname: 'Zippy',
          avatar: {
            type: 'filesystem',
            path: './we_dev/zippy.jpg',
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
              path: './we_dev/zerbina.jpg',
            },
          },
        },
      ],
      applets: [
        {
          name: 'KanDo Hot Reload',
          instanceName: 'KanDo Hot Reload',
          registeringAgent: 1,
          joiningAgents: [2],
        },
        // {
        //   name: 'gamez',
        //   instanceName: 'gamez',
        //   registeringAgent: 1,
        //   joiningAgents: [2],
        // },
        // {
        //   name: 'vines',
        //   instanceName: 'vines',
        //   registeringAgent: 1,
        //   joiningAgents: [2],
        // },
      ],
    },
  ],
  applets: [
    {
      name: 'KanDo Hot Reload',
      subtitle: 'KanDo',
      description: 'task it it!',
      icon: {
        type: 'filesystem',
        path: './we_dev/kando_icon.png',
      },
      source: {
        type: 'localhost',
        happPath: './workdir/kando.happ',
        uiPort: 1420,
      },
    },
    // {
    //     name: 'gamez',
    //     subtitle: 'play!',
    //     description: 'Real-time games based on syn',
    //     icon: {
    //       type: "https",
    //       url: "https://raw.githubusercontent.com/holochain-apps/gamez/main/we_dev/gamez_icon.svg"
    //     },
    //     source: {
    //       type: "https",
    //       url: "https://github.com/holochain-apps/gamez/releases/download/v0.7.3/gamez.webhapp"
    //     },
    //   },
    //   {
    //   name: 'vines',
    //   subtitle: 'Chat',
    //   description: 'Chat',
    //   icon: {
    //     type: 'https',
    //     url: 'https://lightningrodlabs.org/projects/vines.svg',
    //   },
    //   source: {
    //     type: 'https',
    //     url: 'https://github.com/lightningrodlabs/vines/releases/download/we-applet-rc/vines-we_applet-1.9.0.webhapp',
    //   },
    // },
  ],
})
