const preset = require('../../packages/config/tailwind-preset.js')
const ritmoAppExtend = require('../../packages/config/ritmo-app-theme.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: ritmoAppExtend,
  },
  plugins: [],
}
