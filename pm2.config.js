module.exports = {
  apps: [
    {
      name: 'web-gui',
      script: 'npm run web',
      // watch: ['data', 'docs'],
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
