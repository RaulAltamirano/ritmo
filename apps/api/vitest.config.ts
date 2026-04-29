import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: './tests/setup/global-setup.ts',
    setupFiles: [
      './tests/setup/load-test-env.ts',
      './tests/setup/worker-context.ts',
      './tests/setup/per-test-setup.ts',
    ],
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'coverage'],
    /**
     * Shared `public` schema + TRUNCATE: one process and one test at a time (avoids in-file parallel `it` races).
     */
    fileParallelism: false,
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 1,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        'scripts/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    /** Bcrypt in register + V8 coverage can exceed 15s on one-off integration tests. */
    testTimeout: 30_000,
    hookTimeout: 30000,
    reporters: ['default', 'junit'],
    outputFile: { junit: './coverage/junit.xml' },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests'),
      '@shared': resolve(__dirname, '../../packages/shared/src'),
    },
  },
})
