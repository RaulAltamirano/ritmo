import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@ritmo/ui': resolve(__dirname, '../src'),
      // Mock de composables para Storybook
      '../../composables': resolve(__dirname, '../src/composables'),
      '../../../composables': resolve(__dirname, '../src/composables'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  optimizeDeps: {
    include: ['vue', 'vue-router'],
    exclude: ['@storybook/addon-a11y', '@storybook/addon-themes']
  },
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: ['fsevents']
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  define: {
    // Variables globales para Storybook
    'process.env.NODE_ENV': '"development"',
    'process.env.STORYBOOK': 'true'
  }
})
