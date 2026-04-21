import type { Config } from 'tailwindcss'
import webConfig from './apps/web/tailwind.config'

/**
 * Config agregador para la raíz del monorepo (Turbo, IDE, plugins).
 * Importa `apps/web/tailwind.config`; el tema producto vive en
 * `packages/config/ritmo-app-theme.cjs` (web + landing).
 * `content` cubre apps y paquetes porque las rutas son relativas a la raíz del repo.
 */
/** Re-export del tema de la app + `content` válido desde la raíz del monorepo. */
const config = {
  ...webConfig,
  content: [
    './apps/web/components/**/*.{js,vue,ts,tsx}',
    './apps/web/layouts/**/*.vue',
    './apps/web/pages/**/*.vue',
    './apps/web/plugins/**/*.{js,ts}',
    './apps/web/app.vue',
    './apps/web/error.vue',
    './apps/web/composables/**/*.{js,ts,tsx}',
    './apps/web/stores/**/*.{js,ts,tsx}',
    './packages/ui/src/**/*.{vue,js,ts,jsx,tsx}',
    './apps/landing/src/**/*.{vue,js,ts,jsx,tsx}',
  ],
} as Config

export default config
