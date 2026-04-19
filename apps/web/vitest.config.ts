import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        '.nuxt/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
        '**/test-specs/**',
      ],
    },
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '~/components': fileURLToPath(new URL('./components', import.meta.url)),
      '~/composables': fileURLToPath(new URL('./composables', import.meta.url)),
      '~/stores': fileURLToPath(new URL('./stores', import.meta.url)),
      '~/utils': fileURLToPath(new URL('./utils', import.meta.url)),
      '~/types': fileURLToPath(new URL('./types', import.meta.url)),
      '~/layouts': fileURLToPath(new URL('./layouts', import.meta.url)),
      '~/pages': fileURLToPath(new URL('./pages', import.meta.url)),
      '~/plugins': fileURLToPath(new URL('./plugins', import.meta.url)),
      '~/middleware': fileURLToPath(new URL('./middleware', import.meta.url)),
      '~/assets': fileURLToPath(new URL('./assets', import.meta.url)),
      '~/public': fileURLToPath(new URL('./public', import.meta.url)),
      '@ritmo/ui': fileURLToPath(new URL('../../packages/ui/src', import.meta.url)),
      '@ritmo/shared': fileURLToPath(
        new URL('../../packages/shared/src', import.meta.url),
      ),
    },
  },
})
