import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseSpinner from './display/BaseSpinner.vue'

const meta: Meta<typeof BaseSpinner> = {
  title: 'Atoms/BaseSpinner',
  component: BaseSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente de spinner versátil con múltiples variantes, tamaños y colores. Incluye spinner orbital elegante, animaciones fluidas y accesibilidad completa. Compatible con WCAG 2.1 AA.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['circular', 'dots'],
      description: 'Variante del spinner',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Tamaño del spinner',
    },
    color: {
      control: { type: 'select' },
      options: [
        'primary',
        'secondary',
        'success',
        'warning',
        'error',
        'info',
        'neutral',
        'auto',
      ],
      description: 'Color del spinner',
    },
    ariaLabel: {
      control: { type: 'text' },
      description: 'Etiqueta para accesibilidad',
    },
  },
  args: {
    variant: 'circular',
    size: 'md',
    color: 'primary',
    ariaLabel: 'Loading',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { BaseSpinner },
    setup() {
      return { args }
    },
    template: '<BaseSpinner v-bind="args" />',
  }),
}

// Variantes
export const Circular: Story = {
  render: args => ({
    components: { BaseSpinner },
    setup() {
      return { args }
    },
    template: '<BaseSpinner v-bind="args" />',
  }),
  args: {
    variant: 'circular',
  },
}

export const Dots: Story = {
  render: args => ({
    components: { BaseSpinner },
    setup() {
      return { args }
    },
    template: '<BaseSpinner v-bind="args" />',
  }),
  args: {
    variant: 'dots',
  },
}

// Spinner orbital mejorado
export const OrbitalSpinner: Story = {
  render: args => ({
    components: { BaseSpinner },
    setup() {
      return { args }
    },
    template: '<BaseSpinner v-bind="args" />',
  }),
  args: {
    variant: 'circular',
    color: 'success',
    size: 'lg',
  },
}

export const OrbitalSpinnerColors: Story = {
  render: () => ({
    components: { BaseSpinner },
    template: `
      <div class="flex items-center gap-6">
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner variant="circular" color="primary" size="lg" />
          <span class="text-sm text-gray-600 dark:text-gray-400">Primary</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner variant="circular" color="success" size="lg" />
          <span class="text-sm text-gray-600 dark:text-gray-400">Success</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner variant="circular" color="warning" size="lg" />
          <span class="text-sm text-gray-600 dark:text-gray-400">Warning</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner variant="circular" color="error" size="lg" />
          <span class="text-sm text-gray-600 dark:text-gray-400">Error</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner variant="circular" color="info" size="lg" />
          <span class="text-sm text-gray-600 dark:text-gray-400">Info</span>
        </div>
      </div>
    `,
  }),
}

// Tamaños
export const Sizes: Story = {
  render: () => ({
    components: { BaseSpinner },
    template: `
      <div class="flex items-center gap-4">
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner size="xs" />
          <span class="text-xs text-gray-600 dark:text-gray-400">xs</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner size="sm" />
          <span class="text-xs text-gray-600 dark:text-gray-400">sm</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner size="md" />
          <span class="text-xs text-gray-600 dark:text-gray-400">md</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner size="lg" />
          <span class="text-xs text-gray-600 dark:text-gray-400">lg</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner size="xl" />
          <span class="text-xs text-gray-600 dark:text-gray-400">xl</span>
        </div>
      </div>
    `,
  }),
}

// Colores
export const Colors: Story = {
  render: () => ({
    components: { BaseSpinner },
    template: `
      <div class="grid grid-cols-4 gap-4">
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner color="primary" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Primary</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner color="secondary" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Secondary</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner color="success" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Success</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner color="warning" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Warning</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner color="error" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Error</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner color="info" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Info</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner color="neutral" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Neutral</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner color="auto" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Auto</span>
        </div>
      </div>
    `,
  }),
}

// Comparación de variantes
export const VariantsComparison: Story = {
  render: () => ({
    components: { BaseSpinner },
    template: `
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Circular Spinners</h3>
          <div class="flex items-center gap-4">
            <BaseSpinner variant="circular" size="sm" color="primary" />
            <BaseSpinner variant="circular" size="md" color="success" />
            <BaseSpinner variant="circular" size="lg" color="warning" />
            <BaseSpinner variant="circular" size="xl" color="error" />
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dots Spinners</h3>
          <div class="flex items-center gap-4">
            <BaseSpinner variant="dots" size="sm" color="primary" />
            <BaseSpinner variant="dots" size="md" color="success" />
            <BaseSpinner variant="dots" size="lg" color="warning" />
            <BaseSpinner variant="dots" size="xl" color="error" />
          </div>
        </div>
      </div>
    `,
  }),
}

// Spinners en contexto
export const InContext: Story = {
  render: () => ({
    components: { BaseSpinner },
    template: `
      <div class="space-y-6">
        <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <BaseSpinner size="sm" color="primary" />
          <span class="text-gray-900 dark:text-white">Cargando datos...</span>
        </div>
        
        <div class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <BaseSpinner variant="dots" size="sm" color="info" />
          <span class="text-blue-900 dark:text-blue-100">Procesando información...</span>
        </div>
        
        <div class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <BaseSpinner size="sm" color="success" />
          <span class="text-green-900 dark:text-green-100">Guardando cambios...</span>
        </div>
        
        <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <BaseSpinner variant="dots" size="sm" color="error" />
          <span class="text-red-900 dark:text-red-100">Reintentando conexión...</span>
        </div>
      </div>
    `,
  }),
}

// Spinners con texto
export const WithText: Story = {
  render: () => ({
    components: { BaseSpinner },
    template: `
      <div class="space-y-4">
        <div class="flex flex-col items-center gap-3 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <BaseSpinner size="lg" color="primary" />
          <p class="text-gray-700 dark:text-gray-300 text-center">
            Cargando la aplicación...
          </p>
        </div>
        
        <div class="flex flex-col items-center gap-3 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <BaseSpinner variant="dots" size="lg" color="info" />
          <p class="text-blue-700 dark:text-blue-300 text-center">
            Sincronizando datos...
          </p>
        </div>
        
        <div class="flex flex-col items-center gap-3 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <BaseSpinner size="lg" color="success" />
          <p class="text-green-700 dark:text-green-300 text-center">
            Actualizando perfil...
          </p>
        </div>
      </div>
    `,
  }),
}

// Spinners en botones
export const InButtons: Story = {
  render: () => ({
    components: { BaseSpinner },
    template: `
      <div class="space-y-4">
        <div class="flex flex-wrap gap-4">
          <button class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
            <BaseSpinner size="sm" color="auto" />
            Guardando...
          </button>
          
          <button class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">
            <BaseSpinner variant="dots" size="sm" color="auto" />
            Procesando...
          </button>
          
          <button class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg">
            <BaseSpinner size="sm" color="auto" />
            Eliminando...
          </button>
        </div>
        
        <div class="flex flex-wrap gap-4">
          <button class="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg">
            <BaseSpinner size="sm" color="neutral" />
            Cargando...
          </button>
          
          <button class="flex items-center gap-2 px-4 py-2 bg-transparent text-blue-600 border border-blue-600 rounded-lg">
            <BaseSpinner variant="dots" size="sm" color="primary" />
            Enviando...
          </button>
        </div>
      </div>
    `,
  }),
}

// Spinners accesibles
export const Accessible: Story = {
  render: () => ({
    components: { BaseSpinner },
    template: `
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <BaseSpinner 
            size="md" 
            color="primary" 
            aria-label="Cargando contenido principal"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Spinner con aria-label descriptivo
          </span>
        </div>
        
        <div class="flex items-center gap-4">
          <BaseSpinner 
            variant="dots" 
            size="md" 
            color="success" 
            aria-label="Procesando formulario"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Spinner de puntos con aria-label específico
          </span>
        </div>
        
        <div class="flex items-center gap-4">
          <BaseSpinner 
            size="md" 
            color="warning" 
            aria-label="Sincronizando datos del servidor"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Spinner con aria-label detallado
          </span>
        </div>
      </div>
    `,
  }),
}

// Accesibilidad
export const Accessibility: Story = {
  render: args => ({
    components: { BaseSpinner },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <BaseSpinner v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Spinner con roles ARIA apropiados y navegación por teclado
        </p>
      </div>
    `,
  }),
  args: {
    'aria-label': 'Spinner accesible con navegación por teclado',
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
