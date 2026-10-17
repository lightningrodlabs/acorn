import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 60 * 1000 * 3,
    exclude: ['**/node_modules/**'],
  },
})
