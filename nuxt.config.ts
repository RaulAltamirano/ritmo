export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxt/devtools'],

  typescript: {
    strict: true,
    shim: false,
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    public: {
      apiBase: process.env.API_BASE || '',
      appName: 'Ritmo',
    },
  },

  nitro: {
    routeRules: {
      '/api/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      },
    },
  },

  app: {
    head: {
      title: 'Ritmo',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Ritmo - Personal Productivity App' },
      ],
    },
  },

  imports: {
    dirs: ['stores', 'composables', 'utils'],
  },

  experimental: {
    payloadExtraction: false,
  },
})
