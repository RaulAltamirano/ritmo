// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  // Configuración de TypeScript
  typescript: {
    strict: true
  },

  // Configuración de alias
  alias: {
    '@components': '~/components',
    '@composables': '~/composables',
    '@stores': '~/stores',
    '@utils': '~/utils',
    '@types': '~/types'
  },

  // Configuración de módulos
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@pinia/nuxt'
  ],

  // Configuración de i18n
  i18n: {
    locales: [
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' }
    ],
    defaultLocale: 'es',
    strategy: 'no_prefix'
  },

  // Configuración de TailwindCSS
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: '~/tailwind.config.ts',
    exposeConfig: true
  },

  // Configuración de Pinia
  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate']
  },

  // Configuración de rutas (Nuxt maneja las rutas automáticamente)
  router: {
    options: {
      strict: true
    }
  },

  // Configuración de composables
  imports: {
    dirs: [
      '~/composables'
    ]
  },

  // Configuración de componentes - mejorada
  components: {
    dirs: [
      '~/components',
      '~/components/atoms',
      '~/components/molecules',
      '~/components/organisms',
      '~/components/templates'
    ],
    global: true
  },

  // Configuración de entorno
  runtimeConfig: {
    public: {
      apiBaseURL: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'
    }
  },

  compatibilityDate: '2025-05-15',
  devtools: { enabled: true }
})
