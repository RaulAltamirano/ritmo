import type { Config } from 'tailwindcss'

const preset = require('../../packages/config/tailwind-preset.js')
const ritmoAppExtend = require('../../packages/config/ritmo-app-theme.cjs')

const config: Config = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
    './composables/**/*.{js,ts}',
    './stores/**/*.{js,ts}',
    '../../packages/ui/src/**/*.{vue,js,ts}',
  ],
  darkMode: 'class',
  presets: [preset],
  theme: {
    extend: ritmoAppExtend,
  },
  plugins: [],
}

export default config
