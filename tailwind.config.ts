import type { Config } from 'tailwindcss'
import webConfig from './apps/web/tailwind.config'

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
