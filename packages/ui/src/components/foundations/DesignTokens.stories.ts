import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { cssColorVariables, semanticColors } from '../../tokens/colors'
import { spacingTokens } from '../../tokens/spacing'
import { typographyTokens } from '../../tokens/typography'

type ColorRampName =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'

const COLOR_RAMPS: ColorRampName[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
  'neutral',
]

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const

const textStyles = [
  'display',
  'h1',
  'h2',
  'h3',
  'body-large',
  'body',
  'body-small',
  'caption',
  'button',
] as const

const spacingScale = Object.entries(spacingTokens).filter(([, value]) => typeof value === 'string')
const ROOT_FONT_SIZE_PX = 16

function remToPx(value: string): string {
  if (!value.endsWith('rem')) return value
  const rem = Number.parseFloat(value.replace('rem', ''))
  if (Number.isNaN(rem)) return value
  return `${Math.round(rem * ROOT_FONT_SIZE_PX)}px`
}

const DesignTokensOverview = {
  setup() {
    return {
      COLOR_RAMPS,
      SHADES,
      semanticColors,
      cssColorVariables,
      spacingScale,
      typographyTokens,
      textStyles,
      remToPx,
    }
  },
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-8">
      <div class="mx-auto max-w-7xl space-y-10">
        <header class="space-y-2">
          <h1 class="text-3xl font-bold tracking-tight">Design Tokens</h1>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            Referencia visual para validar consistencia, contraste y escalas del sistema.
          </p>
        </header>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Color Ramps (Tailwind utility tokens)</h2>
          <div class="space-y-4">
            <div
              v-for="ramp in COLOR_RAMPS"
              :key="ramp"
              class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
            >
              <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide">{{ ramp }}</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                <div
                  v-for="shade in SHADES"
                  :key="shade"
                  :class="[semanticColors[ramp][shade], 'rounded-md border p-2 text-xs']"
                >
                  <div class="font-semibold">{{ shade }}</div>
                  <div class="opacity-80 mt-1">{{ semanticColors[ramp][shade] }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Core CSS Variables</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <div
              v-for="[name, value] in Object.entries(cssColorVariables)"
              :key="name"
              class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3"
            >
              <div class="text-xs font-mono text-slate-500 dark:text-slate-400">{{ name }}</div>
              <div class="mt-1 text-sm font-medium">{{ value }}</div>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Spacing Scale</h2>
          <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div
              v-for="[token, value] in spacingScale"
              :key="token"
              class="flex items-center gap-4"
            >
              <div class="w-16 text-xs font-mono text-slate-500 dark:text-slate-400">{{ token }}</div>
              <div class="w-20 text-xs font-medium">{{ value }} ({{ remToPx(value) }})</div>
              <div class="h-4 rounded bg-blue-500" :style="{ width: value }"></div>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Typography Styles</h2>
          <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-5">
            <div
              v-for="styleName in textStyles"
              :key="styleName"
              class="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-b-0"
            >
              <div class="mb-1 text-xs font-mono text-slate-500 dark:text-slate-400">{{ styleName }}</div>
              <p
                :style="{
                  fontSize: typographyTokens.textStyles[styleName].fontSize,
                  fontWeight: typographyTokens.textStyles[styleName].fontWeight,
                  lineHeight: typographyTokens.textStyles[styleName].lineHeight,
                  letterSpacing: typographyTokens.textStyles[styleName].letterSpacing,
                  fontFamily: styleName.includes('display')
                    ? typographyTokens.fontFamily.display.join(', ')
                    : typographyTokens.fontFamily.sans.join(', '),
                }"
              >
                Ritmo UI Typography Sample - The quick brown fox jumps over the lazy dog.
              </p>
              <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                size {{ typographyTokens.textStyles[styleName].fontSize }} /
                weight {{ typographyTokens.textStyles[styleName].fontWeight }} /
                line-height {{ typographyTokens.textStyles[styleName].lineHeight }}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
}

const meta = {
  title: 'Foundations/Design Tokens',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Vista profesional de tokens del design system: paletas, variables CSS, spacing y tipografía.',
      },
    },
  },
  tags: ['autodocs'],
  render: () => DesignTokensOverview,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}
