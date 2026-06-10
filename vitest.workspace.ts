import { resolve } from 'node:path'
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    test: {
      name: 'shared',
      include: ['packages/shared/test/**/*.test.ts'],
      environment: 'node',
    },
  },
  {
    test: {
      name: 'server',
      include: ['apps/server/test/**/*.test.ts'],
      environment: 'node',
    },
  },
  {
    resolve: {
      alias: { '@': resolve(__dirname, 'apps/web/src') },
    },
    test: {
      name: 'web',
      include: ['apps/web/test/**/*.test.ts'],
      environment: 'node',
    },
  },
])
