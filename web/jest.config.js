/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.[tj]s$': [
      'babel-jest',
      {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                node: 'current',
              },
            },
          ],
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((@holochain/(client|serialization))|@noble/ed25519|emittery|lodash-es).*)',
  ],
  globals: {
    __MAIN_APP_ID__: 'test-main-app-id',
    __ADMIN_PORT__: 'test-admin-port',
    __APP_PORT__: 'test-app-port',
  },
}
