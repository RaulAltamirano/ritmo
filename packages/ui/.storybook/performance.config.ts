// Configuración de performance para Storybook
import type { StorybookConfig } from '@storybook/vue3-vite'

export const performanceConfig: Partial<StorybookConfig> = {
  // Optimización de build
  viteFinal: async (config) => {
    // Optimización de dependencias
    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.include = [
      'vue',
      'vue-router',
      '@storybook/testing-library',
      '@storybook/jest',
      'axe-core',
      'axe-playwright'
    ]
    
    // Optimización de build
    config.build = config.build || {}
    config.build.sourcemap = true
    config.build.rollupOptions = config.build.rollupOptions || {}
    config.build.rollupOptions.external = ['fsevents']
    
    // Optimización de CSS
    config.css = config.css || {}
    config.css.postcss = {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        require('cssnano')({
          preset: ['default', {
            discardComments: { removeAll: true },
            normalizeWhitespace: false
          }]
        })
      ]
    }
    
    return config
  },
  
  // Configuración de stories para mejor performance
  stories: [
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  
  // Configuración de addons para performance
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-themes',
    '@storybook/addon-interactions'
  ],
  
  // Configuración de core para performance
  core: {
    disableTelemetry: true,
    enableCrashReports: false,
    builder: '@storybook/builder-vite'
  },
  
  // Configuración de typescript para performance
  typescript: {
    check: false,
    reactDocgen: false,
    skipBabel: true
  },
  
  // Configuración de docs para performance
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation'
  }
}

export default performanceConfig
