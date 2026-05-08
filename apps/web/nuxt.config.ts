export default defineNuxtConfig({
  devtools: { enabled: true },

  nitro: {
    routeRules: {
      '/': { redirect: '/today' }
    }
  },

  runtimeConfig: {
    apiSecret: process.env.API_SECRET,

    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL ??
        process.env.API_BASE_URL ??
        'http://localhost:3001/api',
      appName: process.env.NUXT_PUBLIC_APP_NAME ?? 'Ritmo',
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION ?? '2.0.0',
    },
  },

  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],

  css: ['~/assets/css/tailwind.css', '~/assets/css/theme-transitions.css'],

  imports: {
    dirs: ['~/composables', '~/stores', '~/utils'],
  },

  typescript: {
    strict: true,
    typeCheck: process.env.CI === 'true',
  },

  vite: {
    resolve: {
      alias: {
        '@ritmo/ui': '/home/pacman/Documents/WORKSPACE/ritmo/packages/ui/src',
        '@': '/home/pacman/Documents/WORKSPACE/ritmo/apps/web',
        '@components': '/home/pacman/Documents/WORKSPACE/ritmo/apps/web/components',
      },
    },
    optimizeDeps: {
      include: ['lucide-vue-next', '@vueuse/core'],
    },
  },

  app: {
    head: {
      title: 'Ritmo - Smart Time Management',
      titleTemplate: '%s | Ritmo',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Intelligent time management and productivity app with AI-powered study techniques',
        },
        { name: 'theme-color', content: '#14b8a6' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        // `black-translucent` u otras variantes: coordinar con diseño PWA (spec H6)
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Ritmo' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/logo-ritmo.svg' },
        { rel: 'apple-touch-icon', href: '/logo-ritmo.svg' },
        { rel: 'shortcut icon', href: '/logo-ritmo.svg' },
      ],
      script: [
        {
          // Con CSP estricta en producción, este bloque requerirá `nonce` o hash (spec H8).
          innerHTML: `
            (function() {
              // Migrar preferencias de tema existentes
              const OLD_STORAGE_KEY = 'ritmo-theme';
              const NEW_STORAGE_KEY = 'theme';
              const MODE_KEY = 'theme-mode';
              
              const oldTheme = localStorage.getItem(OLD_STORAGE_KEY);
              if (oldTheme && !localStorage.getItem(NEW_STORAGE_KEY)) {
                localStorage.setItem(NEW_STORAGE_KEY, oldTheme);
                localStorage.setItem(MODE_KEY, oldTheme === 'dark' ? 'dark' : 'light');
                localStorage.removeItem(OLD_STORAGE_KEY);
              }
              
              // Prevenir FOUC - aplicar tema ANTES de cualquier renderizado
              const savedTheme = localStorage.getItem(NEW_STORAGE_KEY);
              const savedMode = localStorage.getItem(MODE_KEY);
              const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              
              // Determinar tema efectivo
              let isDark;
              if (savedMode === 'system' || !savedMode) {
                isDark = systemPrefersDark;
              } else if (savedMode === 'dark') {
                isDark = true;
              } else {
                isDark = false;
              }
              
              // Aplicar tema inmediatamente
              document.documentElement.classList.toggle('dark', isDark);
              document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
              
              // Guardar preferencias si no existen
              if (!savedTheme) {
                localStorage.setItem(NEW_STORAGE_KEY, isDark ? 'dark' : 'light');
              }
              if (!savedMode) {
                localStorage.setItem(MODE_KEY, 'system');
              }
            })();
          `,
          type: 'text/javascript',
        },
      ],
    },
  },
})
