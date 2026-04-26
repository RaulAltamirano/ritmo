import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)

/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
  stories: [
    '../src/components/**/*.mdx',
    '../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-links'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/vue3-vite'),
    options: {},
  },
  docs: {
    autodocs: false,
  },
  viteFinal: async config => {
    // Optimización de dependencias
    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.include = ['vue', 'vue-router']

    // Optimización para desarrollo
    config.build = config.build || {}
    config.build.sourcemap = true
    config.build.rollupOptions = config.build.rollupOptions || {}
    config.build.rollupOptions.external = ['fsevents']

    return config
  },
}

export default config

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')))
}
