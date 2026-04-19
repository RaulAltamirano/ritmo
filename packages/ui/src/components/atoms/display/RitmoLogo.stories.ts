import type { Meta, StoryObj } from '@storybook/vue3-vite'
import RitmoLogo from './RitmoLogo.vue'

const meta: Meta<typeof RitmoLogo> = {
  title: 'Atoms/RitmoLogo',
  component: RitmoLogo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente del logo de Ritmo con múltiples variantes, tamaños y colores. Incluye soporte para dark mode y accesibilidad completa. Compatible con WCAG 2.1 AA.',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'number', min: 20, max: 200 },
      description: 'Tamaño del logo en píxeles',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'monochrome', 'white'],
      description: 'Variante del logo',
    },
    ariaLabel: {
      control: { type: 'text' },
      description: 'Etiqueta para accesibilidad',
    },
  },
  args: {
    size: 40,
    variant: 'default',
    ariaLabel: 'Ritmo Logo',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { RitmoLogo },
    setup() {
      return { args }
    },
    template: '<RitmoLogo v-bind="args" />',
  }),
}

// Variantes
export const Primary: Story = {
  render: args => ({
    components: { RitmoLogo },
    setup() {
      return { args }
    },
    template: '<RitmoLogo v-bind="args" />',
  }),
  args: {
    variant: 'primary',
  },
}

export const Monochrome: Story = {
  render: args => ({
    components: { RitmoLogo },
    setup() {
      return { args }
    },
    template: '<RitmoLogo v-bind="args" />',
  }),
  args: {
    variant: 'monochrome',
  },
}

export const White: Story = {
  render: args => ({
    components: { RitmoLogo },
    setup() {
      return { args }
    },
    template: `
      <div class="bg-gray-900 p-8 rounded-lg">
        <RitmoLogo v-bind="args" />
      </div>
    `,
  }),
  args: {
    variant: 'white',
  },
}

// Tamaños
export const Sizes: Story = {
  render: () => ({
    components: { RitmoLogo },
    template: `
      <div class="flex items-center gap-4">
        <div class="flex flex-col items-center gap-2">
          <RitmoLogo :size="20" />
          <span class="text-xs text-gray-600 dark:text-gray-400">20px</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <RitmoLogo :size="40" />
          <span class="text-xs text-gray-600 dark:text-gray-400">40px</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <RitmoLogo :size="60" />
          <span class="text-xs text-gray-600 dark:text-gray-400">60px</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <RitmoLogo :size="80" />
          <span class="text-xs text-gray-600 dark:text-gray-400">80px</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <RitmoLogo :size="120" />
          <span class="text-xs text-gray-600 dark:text-gray-400">120px</span>
        </div>
      </div>
    `,
  }),
}

// Comparación de variantes
export const VariantsComparison: Story = {
  render: () => ({
    components: { RitmoLogo },
    template: `
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Variantes</h3>
          <div class="flex items-center gap-6">
            <div class="flex flex-col items-center gap-2">
              <RitmoLogo :size="60" variant="default" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Default</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <RitmoLogo :size="60" variant="primary" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Primary</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <RitmoLogo :size="60" variant="monochrome" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Monochrome</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <div class="bg-gray-900 p-4 rounded-lg">
                <RitmoLogo :size="60" variant="white" />
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400">White</span>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// Logo en contexto
export const InContext: Story = {
  render: () => ({
    components: { RitmoLogo },
    template: `
      <div class="space-y-6">
        <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <RitmoLogo :size="32" />
          <span class="text-gray-900 dark:text-white font-semibold">Ritmo</span>
        </div>
        
        <div class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <RitmoLogo :size="32" variant="primary" />
          <span class="text-blue-900 dark:text-blue-100 font-semibold">Ritmo</span>
        </div>
        
        <div class="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
          <RitmoLogo :size="32" variant="white" />
          <span class="text-white font-semibold">Ritmo</span>
        </div>
      </div>
    `,
  }),
}

// Logo en header
export const InHeader: Story = {
  render: () => ({
    components: { RitmoLogo },
    template: `
      <div class="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3">
              <RitmoLogo :size="32" />
              <span class="text-xl font-bold text-gray-900 dark:text-white">Ritmo</span>
            </div>
            <nav class="flex items-center gap-6">
              <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Dashboard</a>
              <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Proyectos</a>
              <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Configuración</a>
            </nav>
          </div>
        </div>
      </div>
    `,
  }),
}

// Logo en footer
export const InFooter: Story = {
  render: () => ({
    components: { RitmoLogo },
    template: `
      <div class="w-full bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="flex flex-col items-center gap-6">
            <RitmoLogo :size="60" variant="white" />
            <p class="text-gray-400 text-center max-w-md">
              Ritmo - Tu compañero de productividad personalizada
            </p>
            <div class="flex items-center gap-6 text-gray-400">
              <a href="#" class="hover:text-white">Términos</a>
              <a href="#" class="hover:text-white">Privacidad</a>
              <a href="#" class="hover:text-white">Soporte</a>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// Logo en cards
export const InCards: Story = {
  render: () => ({
    components: { RitmoLogo },
    template: `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex flex-col items-center gap-4">
            <RitmoLogo :size="48" variant="primary" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Productividad</h3>
            <p class="text-gray-600 dark:text-gray-400 text-center">
              Optimiza tu flujo de trabajo con Ritmo
            </p>
          </div>
        </div>
        
        <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex flex-col items-center gap-4">
            <RitmoLogo :size="48" variant="monochrome" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Simplicidad</h3>
            <p class="text-gray-600 dark:text-gray-400 text-center">
              Interfaz limpia y fácil de usar
            </p>
          </div>
        </div>
        
        <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex flex-col items-center gap-4">
            <RitmoLogo :size="48" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Personalización</h3>
            <p class="text-gray-600 dark:text-gray-400 text-center">
              Adapta Ritmo a tus necesidades
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}

// Logo accesible
export const Accessible: Story = {
  render: () => ({
    components: { RitmoLogo },
    template: `
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <RitmoLogo 
            :size="40" 
            aria-label="Logo de Ritmo - Tu compañero de productividad"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Logo con aria-label descriptivo
          </span>
        </div>
        
        <div class="flex items-center gap-4">
          <RitmoLogo 
            :size="40" 
            variant="primary"
            aria-label="Logo de Ritmo en color primario"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Logo con aria-label específico
          </span>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="bg-gray-900 p-4 rounded-lg">
            <RitmoLogo 
              :size="40" 
              variant="white"
              aria-label="Logo de Ritmo en color blanco sobre fondo oscuro"
            />
          </div>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Logo con aria-label detallado
          </span>
        </div>
      </div>
    `,
  }),
}

// Accesibilidad
export const Accessibility: Story = {
  render: args => ({
    components: { RitmoLogo },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <RitmoLogo v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Logo con roles ARIA apropiados y navegación por teclado
        </p>
      </div>
    `,
  }),
  args: {
    'aria-label': 'Logo de Ritmo accesible con navegación por teclado',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
}
