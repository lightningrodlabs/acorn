/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  // .tsx is included so COMPONENT tests can mount real components (the panel
  // test); suites that don't need a DOM keep the faster `node` environment
  // above and opt in per file with an `@jest-environment jsdom` docblock.
  transform: {
    '^.+\\.[tj]sx?$': [
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
          // React 16: classic runtime (components import React themselves)
          ['@babel/preset-react', { runtime: 'classic' }],
        ],
      },
    ],
  },
  moduleNameMapper: {
    // components import their own styles; jest can't parse them and they carry
    // no behaviour worth asserting
    '\\.(scss|css)$': '<rootDir>/test/styleStub.js',
    // likewise for image imports, which webpack resolves in the real build
    '\\.(svg|png|jpe?g|gif|webp)$': '<rootDir>/test/assetStub.js',
    // ESM-only remark/rehype plugins reach jest untransformed. The panel passes
    // remark-gfm straight to RichText, which component tests mock out, so a
    // no-op plugin is enough to keep the import resolvable.
    '^remark-gfm$': '<rootDir>/test/esmPluginStub.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((@holochain/(client|serialization))|@theweave/api|@noble/ed25519|emittery|lodash-es).*)',
  ],
  setupFiles: ['<rootDir>/test/jest.setup.ts'],
  globals: {
    __MAIN_APP_ID__: 'test-main-app-id',
    __ADMIN_PORT__: '8000',
    __APP_PORT__: '8000',
  },
}
