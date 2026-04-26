import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    name: '@ritmo/ui-a11y',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup-simple.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.a11y.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/components/**/*.vue',
        'src/composables/**/*.ts',
        'src/utils/**/*.ts'
      ],
      exclude: [
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/node_modules/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src')
    }
  }
})
