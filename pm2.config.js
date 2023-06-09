module.exports = {
  apps: [
    {
      name: 'web-gui',
      script: 'npm run web',
      ignore_watch: ['.'],
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'electron-holochain',
      script: './electron/node_modules/.bin/electron electron',
      watch: ['electron/dist'],
      env: {
        NODE_ENV: 'development',
        ACORN_AGENT_NUM: '1',
        WEB_PORT: '8081',
      },
    },
    // {
    //   name: 'electron-recompile',
    //   script: './frontend/electron/node_modules/.bin/tsc --project frontend/electron/tsconfig.json',
    //   watch: ['frontend/electron/src'],
    //   env: {
    //     NODE_ENV: 'development',
    //   },
    // },
  ],
}
