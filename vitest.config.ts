import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      // Root project - tests in the root directory
      {
        name: 'root',
        test: {
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./test/setup.ts'],
          include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          exclude: [
            'node_modules/',
            'dist/',
            '.nuxt/',
            '.output/',
            'coverage/',
            'apps/**',
            'packages/**'
          ]
        }
      },
      // API project
      './apps/api/vitest.config.ts',
      // Web project
      './apps/web/vitest.config.ts',
      // UI package project
      './packages/ui/vitest.config.ts',
      // UI package accessibility tests
      './packages/ui/vitest.a11y.config.ts'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@ritmo/shared': resolve(__dirname, './packages/shared/src'),
      '@ritmo/ui': resolve(__dirname, './packages/ui/src'),
      '@ritmo/config': resolve(__dirname, './packages/config/src')
    }
  }
})
